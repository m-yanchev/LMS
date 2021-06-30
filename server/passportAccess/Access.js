import {sendToTeacher} from "../ErrorHandler";
import ActiveService from "../../common/logic/ActiveService";
import PostTransport from "../PostTransport";
import Logging from "../WinstonLogger/Logging"
import Profile from "../../common/logic/Profile";
import {makeResponse} from "../Schema/Schema";
import {GOOGLE_ID, GOOGLE_KEY, SESSION_KEY, VK_ID, VK_KEY} from "./accessConsts";
import {DB_ACCESS} from "../MongoDBDataSource/accessConsts";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const crypto = require('crypto');
const dbClient = require("../dbClient");
const {ABSOLUTE_SITE_ADDRESS} = require("../../common/constants");
const {sendError} = require("../ErrorHandler")
const Schema = require("../Schema/Schema")

const logger = Logging()

export async function route(req, res, next) {
    try {
        switch (req.params.method) {
            case 'auth':
                authenticateLocal(req, res, next);
                return;
            case "logout":
                logout(req, res);
                break;
            case 'checkIn':
                await checkIn(req, res);
                break;
            case 'registration':
                await registration(req, res);
                break;
            case 'updateProfile':
                await updateProfile(req, res);
                break;
            case 'updatePassword':
                await updatePassword(req, res);
                break;
            case 'sendPasswordRestoreLink':
                await sendPasswordRestoreLink(req, res);
                return;
            case 'updatePasswordAfterRestore':
                await updatePasswordAfterRestore(req, res);
                break;
            case 'authFail':
                handleFail(req);
                break;
            default:
                sendError(new Error(`${req.params.method} method not use`))(req, res)
        }
    } catch (e) {
        logger.error("Access.route: req.user = %o, req.body = %o, error = %o", req.user, req.body, e)
        sendError(e)(req, res)
    }
}

export function config(app) {
    try {
        configStrategies();
        initPassport(app);
    } catch (e) {
        app.use(sendError(e))
    }
}

function authenticateLocal(req, res, next) {
    passport.authenticate(
        'local',
        {},
        function (e, profile) {
            if (profile) {
                login(req, res, profile)
            } else {
                sendProfile(401)(req, res)
            }
        })(req, res, next);
}

export function useAuthSrc(app) {

    app.use(deserializeActiveServiceFromSession)

    app.use('/auth/vkontakte/callback',
        authenticateVkontakteCallback,
        confirmActiveService,
        serializeActiveServiceToSession,
        (req, res) => res.redirect("/")
    );
    app.use('/auth/google/callback',
        authenticateGoogleCallback,
        confirmActiveService,
        serializeActiveServiceToSession,
        (req, res) => res.redirect("/")
    );

    app.use('/auth/', deserializeActiveServiceFromBody, serializeActiveServiceToSession)
    app.use('/auth/vkontakte/', authenticateVkontakte)
    app.use('/auth/google', authenticateGoogle)

    function serializeActiveServiceToSession(req, res, next) {
        req.session.activeService = req.activeService.item
        next()
    }

    function deserializeActiveServiceFromSession(req, res, next) {
        req.activeService = ActiveService.create(req.session.activeService)
        delete req.session.activeService
        next()
    }

    function deserializeActiveServiceFromBody(req, res, next) {
        req.activeService = ActiveService.create({name: req.body["activeServiceName"], id: req.body["activeServiceId"]})
        next()
    }

    function confirmActiveService(req, res, next) {
        try {
            const profile = Profile.create(req.user)
            if (profile.isStudentAccess) {
                req.activeService.activate()
            }
        } catch (e) {
            sendToTeacher(e, {
                log: {module: "Access", method: "useAuthSrc.confirmActiveService"},
                post: true
            })
        } finally {
            next()
        }
    }
}

function authenticateGoogle(req, res, next) {
    const options = {
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
    }
    passport.authenticate('google', options)(req, res, next);
}

function authenticateGoogleCallback(req, res, next) {
    passport.authenticate('google', {failureRedirect: '/'})(req, res, next);
}

export function authenticateVkontakte(req, res, next) {
    const options = {
        display: "popup", scope: ["email"], failureRedirect: '/'
    }
    passport.authenticate('vkontakte', options)(req, res, next)
}

function authenticateVkontakteCallback(req, res, next) {
    passport.authenticate('vkontakte', {failureRedirect: '/'})(req, res, next)
}

function handleFail(req) {
    req.status = 401;
}

async function registration(req, res) {
    const {newPassword, ...profile} = req.body;
    const userId = await findLocalProfile(profile.email);
    if (userId) {
        await sendProfile(401)(req, res)
    } else {
        const id = await addLocalProfile({password: newPassword, name: profile.name, email: profile.email});
        login(req, res, {id, ...profile, access: 'student', src: 'Local'});
    }
}

export async function checkIn(req, res) {

    const {email} = req.body;
    const profile = { name: email, email}
    let userId = await findLocalProfile(email);
    if (userId) {
        res.sendStatus(401)
        return
    }

    const password = await makePassword()
    userId = await addLocalProfile({password, ...profile});

    try {
        await Promise.all([
            login(req, res, {id: userId, ...profile, access: 'student', src: 'Local'}),
            sendPassword({email, password})
        ])
    } catch (e) {
        removeUser()
        throw e
    }

    function removeUser() {
        removeLocalProfile(email).catch(e =>
            sendToTeacher(e, {
                post: true,
                log: {
                    module: "Access", method: "removeLocalProfile", variables: [
                        {name: "email", value: email}, {name: "userId", value: userId}
                    ]
                }
            })
        )
    }
}

async function removeLocalProfile(email) {
    const query = `mutation RemoveProfile($email: String!, $src: ProfileSource!) {
            removeProfile(email: $email, src: $src)
        }`
    await makeResponse(query, {email, src: "Local"})
}

async function addLocalProfile({email, name, password}) {
    return insert({...(await hash(password)), name, email, access: 'student', src: 'Local'});
}

async function findLocalProfile(email) {
    const profile = await find({email, src: 'Local'});
    return profile ? profile.id : null
}

async function sendPassword({email, password}) {
    await PostTransport.send({
        email,
        subject: 'Регистрация на сайте "Тетрадка в клеточку"',
        html: `<p>Для Вас системой был содан аккаунт. Пароль для входа "${password}"</p>`
    })
}

async function makePassword() {

    const alphabet = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"

    const length = 8 + await random(4)
    const codeArray = new Array(length)
    for (let i = 0; i < length; i++) {
        codeArray[i] = random(alphabet.length)
    }
    const charArray = (await Promise.all(codeArray)).map(code => alphabet[code])

    return charArray.join("")

    function random(max) {
        return new Promise((resolve, reject) => {
            crypto["randomInt"](max, (err, n) => {
                if (err) reject(err)
                else resolve(n)
            })
        })
    }
}

function login(req, res, profile) {
    req.logIn(profile, function (err) {
        if (err) {
            logger.error("Access.login: profile = %o, error = %o", profile, error);
            res.sendStatus(500);
        } else {
            sendProfile(200)(req, res)
        }
    });
}

async function sendPasswordRestoreLink(req, res) {
    try {
        const {email} = req.body;

        const user = await find({email, src: 'Local'});
        if (user) {

            const subject = 'Восстановление пароля на сайте tetradkavkletochku.ru'
            const html = '<p>Вы запросили восстановление пароля для вашего аккаунта на сайте tetradkavkletochku.ru.</p>' +
                '<p>Для восстановления пароля перейдите по <a href="' + ABSOLUTE_SITE_ADDRESS +
                '/access/sendPasswordRestoreRequest/' + user.id + '/' + user.hash + '">этой ссылке</a></p>'

            await PostTransport.send({email, html, subject})
            await sendProfile(200)(req, res)

        } else {
            await sendProfile(401)(req, res)
        }
    } catch (e) {
        console.error("Access.sendPasswordRestoreLink: error = %o", e);
        throw e
    }
}

export async function sendPasswordRestoreRequest(req, res, next) {
    try {
        const user = await find({id: req.params.id, hash: req.params.key});
        if (user) {
            req.user = {isRestore: true, ...user}
        } else {
            res.redirect("/")
            return
        }
        next()
    } catch (e) {
        sendError(e)(req, res)
    }
}

async function updatePasswordAfterRestore(req, res) {
    try {
        const {password, id} = req.body;
        await update(id, await hash(password));
        await sendProfile(200)(req, res)
    } catch (e) {
        throw e
    }
}

async function updatePassword(req, res) {
    try {
        if (!req.user) {
            await sendProfile(401)(req, res)
            return;
        }
        const {id} = req.user;
        const user = await find({id, src: 'Local'});
        if (user) {
            const {password, newPassword} = req.body;
            if (user.hash === (await hash(password, user.secret)).hash) {
                await update(user.id, await hash(newPassword));
                await sendProfile(200)(req, res)
            } else {
                await sendProfile(401)(req, res)
            }
        } else {
            await sendProfile(401)(req, res)
        }
    } catch (e) {
        throw e
    }
}

async function updateProfile(req, res) {
    try {
        if (!req.user) {
            await sendProfile(401)(req, res)
            return;
        }
        const {id} = req.user;
        const {name, email, src} = req.body;
        const user = await find({email, src});
        if (user && user.id !== id) {
            await sendProfile(401)(req, res)
        } else {
            await update(id, {name, email});
            req.user.name = name;
            req.user.email = email;
            await sendProfile(200)(req, res)
        }
    } catch (e) {
        throw e
    }
}

function logout(req, res) {
    req.logOut();
    sendProfile(200)(req, res)
}

function configStrategies() {

    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async function (username, password, done) {
        try {
            const user = await find({email: username, src: "Local"});
            if (user) {
                hash(password, user.secret).then(resolve => {
                    if (user.hash === resolve.hash) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                }).catch(e => {
                    return done(e, false)
                });
            } else {
                return done(null, false);
            }
        } catch (e) {
            return done(e, false)
        }
    }));

    passport.use(new VKontakteStrategy({
            clientID: VK_ID,
            clientSecret: VK_KEY,
            callbackURL: ABSOLUTE_SITE_ADDRESS + "/auth/vkontakte/callback"
        },
        function (accessToken, refreshToken, params, profile, done) {
            findOrCreate({src: "vkontakte", profile, params}, done).catch(error => done(error, false))
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_ID,
            clientSecret: GOOGLE_KEY,
            callbackURL: ABSOLUTE_SITE_ADDRESS + "/auth/google/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            findOrCreate({src: "google", profile}, done).catch(error => done(error, false))
        }
    ));

    async function findOrCreate({src, profile}, done) {
        try {
            const access = "student";
            const user = await find({srcId: profile.id, src});
            if (user) {
                return done(null, user);
            } else {
                const email = profile.emails[0].value
                const name = profile.displayName;
                const id = await insert({srcId: profile.id, email, name, src, access});
                return done(null, {id, src, access, email, name});
            }

        } catch (e) {
            return done(e, false)
        }
    }
}

function initPassport(app) {

    const store = new MongoDBStore({
        uri: DB_ACCESS,
        databaseName: "LMSData",
        collection: 'sessions'
    });

    store.on('error', function (e) {
        sendToTeacher(e, {log: {module: "Access", method: "initPassport"}})
    });

    const sessionConfig = {
        secret: SESSION_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 31708800000, secure: process.env.NODE_ENV === 'production'},
        store: store
    };
    app.use(session(sessionConfig));

    app.use(passport.initialize({}));
    app.use(passport.session({}));
    app.use((req, res, next) => {
        if (!req.user) req.user = {access: "common"}
        next()
    })

    passport.serializeUser(function (profile, done) {
        done(null, profile.id);
    });

    passport.deserializeUser(function (id, done) {
        const query = `query Profile($id: ID!) {
                        profile(id: $id) {
                            id,
                            email,
                            name,
                            access,
                            checkCount
                        }
                    }`
        Schema.makeResponse(query, {id}).then(({profile}) =>
            done(null, profile)
        ).catch(e =>
            done(e, null)
        )
    });
}

async function insert(profile) {
    try {
        const {id} = await dbClient({model: 'users', task: 'insert', data: profile});
        return id;
    } catch (e) {
        throw e
    }
}

async function update(id, profile) {
    try {
        await dbClient({model: 'users', task: 'update', data: {id, ...profile}});
    } catch (e) {
        throw e
    }
}

async function find(profile) {
    try {
        return (await dbClient({model: 'users', task: 'find', data: profile}))[0];
    } catch (e) {
        throw e
    }
}

function hash(password, secret) {
    return new Promise((resolve, reject) => {
        if (secret) {
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(password);
            resolve({secret, hash: hmac.digest('hex')});
        } else {
            crypto.randomBytes(16, async (err, buf) => {
                if (err) reject(err);
                const secret = buf.toString('hex');
                resolve(await hash(password, secret))
            });
        }
    });
}

function sendProfile(status) {
    return async function (req, res) {
        try {
            const query = `query Profile {
                profile {
                    id
                    name
                    email
                    access
                    src
                    checkCount
                }
            }`
            const {profile} = await Schema.makeResponse(query, {}, req.user)
            res.status(status).send({profile})
        } catch (e) {
            logger.error("Access.sendProfile: status = %o, req.data = %o, error = %o", status, req.data, e)
            sendError(e)(req, res)
        }
    }
}