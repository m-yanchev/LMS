import React from 'react';
import {
    CssBaseline, List, ListItem, ListItemText, ListItemIcon, Typography, ThemeProvider, Grid, SvgIcon, Box, Hidden
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import MainTemplate from "../common/components/MainTemplate"
import UserMode from "../common/components/UserMode";
import ErrorBoundary from "../ReactApp/smartComponents/ErrorBoundary";
import CourseProgramButton from "../common/components/CourseProgramButton";
import CourseActivateButton from "../common/components/CourseActivateButton";
import getTheme from "../common/theme";
import mergeClassName from "../common/mergeClassName";

const useStyles = makeStyles(theme => {

    const font3 = {
        fontFamily: ["myriad-pro", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "17pt",
        lineHeight: 1.25,
        letterSpacing: 0
    }

    const font4 = {
        fontFamily: ["myriad-pro", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "14pt",
        lineHeight: 1.25,
        letterSpacing: 0
    }

    const font2 = {
        fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 300,
        fontSize: "13.2pt",
        lineHeight: 1.2,
        letterSpacing: 0
    }

    const font1 = {
        fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 100,
        fontSize: "16pt",
        lineHeight: 1.2
    }

    const buttonFont = {
        fontFamily: ["myriad-pro", "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "17pt",
    }

    const button = {
        width: 195,
        height: 55,
        borderRadius: 25,
        margin: "0 15px",
        color: "white",
        ...buttonFont,
        textTransform: "none"
    }

    return {
        p: {
            ...font2,
        },
        leftAngle: {
            top: 67,
            position: "absolute",
            left: -150,
            [theme.breakpoints.down('md')]: {
                width: 950,
            }
        },
        smallLeftAngle: {
            position: "absolute",
            top: 67,
            width: "100%"
        },
        blueBackground: {
            width: "100%",
            position: "absolute",
            bottom: -830,
            [theme.breakpoints.up('lg')]: {
                bottom: -830,
            },
            [theme.breakpoints.down('md')]: {
                bottom: -990,
            },
            [theme.breakpoints.only('xs')]: {
                bottom: -970,
            }
        },
        container: {
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(5, 4),
            },
            [theme.breakpoints.up('md')]: {
                padding: theme.spacing(6, 8),
            }
        },
        barTitle: {
            color: theme.palette.primary.dark,
            padding: "24px 0 0 10px",
            ...theme.typography.barFont
        },
        firstBlock: {
            padding: "0 10px"
        },
        firstList: {
            [theme.breakpoints.up('xs')]: {
                marginTop: 55,
            },
            [theme.breakpoints.down('xs')]: {
                marginTop: 25,
                width: 298,
            }
        },
        li: {
            padding: 0,
            alignItems: "flex-start"
        },
        liText: {
            margin: 0
        },
        firstBlockFinishLi: {
            paddingTop: 10,
            fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            fontWeight: 100,
            fontSize: "20pt",
            lineHeight: 0.8
        },
        firstBlockLI: {
            marginBottom: 10,
            ...font1
        },
        underline: {
            backgroundColor: `${theme.palette.secondary.main}b0`,
            marginTop: -5,
            zIndex: 50
        },
        firstBlockUnderline: {
            [theme.breakpoints.up('sm')]: {
                marginRight: 291,
            },
            [theme.breakpoints.down('xs')]: {
                marginRight: 111,
            },
            width: 155,
            height: 12,
        },
        firstBlockTitle: {
            marginTop: 50,
            color: theme.palette.primary.dark,
            [theme.breakpoints.up('md')]: {
                width: 592,
                alignItems: "flex-start",
            },
            [theme.breakpoints.down('sm')]: {
                width: "100%",
                alignItems: "center",
            }
        },
        titleFirstString: {
            marginBottom: 5,
            fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            fontWeight: 100,
            fontSize: "20pt"
        },
        titleSecondString: {
            fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            fontWeight: 100,
            fontSize: "17pt",
            lineHeight: 1.2,
            letterSpacing: 0,
            [theme.breakpoints.down('sm')]: {
                textAlign: "center",
            },
            [theme.breakpoints.only('sm')]: {
                width: 580,
            },
            [theme.breakpoints.only('xs')]: {
                width: 290,
            }
        },
        buttonGroupWithShadow: {
            [theme.breakpoints.up('sm')]: {
                height: 100,
                width: 475
            },
            [theme.breakpoints.down('xs')]: {
                height: 200,
                width: 320
            },
        },
        buttonGroup: {
            [theme.breakpoints.down('xs')]: {
                flexDirection: "column",
            }
        },
        courseProgramButton: {
            ...button,
            background: `linear-gradient(to top, ${theme.palette.primary.dark} 0%,${theme.palette.primary.main} 
            30%, ${theme.palette.primary.main} 70%, ${theme.palette.primary.light} 100%)`,
            [theme.breakpoints.down('xs')]: {
                marginBottom: 10
            }
        },
        courseActivateButton: {
            ...button,
            background: `linear-gradient(to top, ${theme.palette.secondary.dark} 0%,${theme.palette.secondary.main} 
            30%, ${theme.palette.secondary.main} 70%, ${theme.palette.secondary.light} 100%)`
        },
        buttonShadow: {
            marginTop: 20
        },
        secondBlock: {
            marginTop: 30
        },
        textAfterButtons: {
            ...font4,
            [theme.breakpoints.only('md')]: {
                width: 940
            },
            [theme.breakpoints.only('sm')]: {
                width: 580
            },
            [theme.breakpoints.only('xs')]: {
                width: 300
            },
            margin: "0 10px",
        },
        secondBlockTitle: {
            ...font2,
            marginTop: 54
        },
        secondBlockTitleUnderline: {
            width: 306,
            height: 8,
        },
        check: {
            width: 165
        },
        checkDesc: {
            width: 150
        },
        checkImageBox: {
            height: 215
        },
        checkDescBox: {
            height: 130
        },
        checks: {
            marginTop: 24
        },
        price: {
            [theme.breakpoints.up('md')]: {
                width: 910,
            },
            [theme.breakpoints.down('sm')]: {
                width: 580,
            },
            [theme.breakpoints.down('xs')]: {
                flexDirection: "column",
                width: 320,
            },
            marginTop: 72,
            padding: "0 10px"
        },
        priceImg: {
            marginTop: 1
        },
        priceDescBlock: {
            [theme.breakpoints.up('md')]: {
                width: 700,
            },
            [theme.breakpoints.down('sm')]: {
                width: 360,
            },
            [theme.breakpoints.down('xs')]: {
                marginTop: 15,
                width: 320,
            },
        },
        priceTitleUnderline: {
            [theme.breakpoints.up('md')]: {
                marginLeft: 326,
            },
            [theme.breakpoints.down('xs')]: {
                marginLeft: 50,
            },
            width: 90,
            height: 8
        },
        priceDesc: {
            [theme.breakpoints.up('md')]: {
                marginTop: 30
            },
            [theme.breakpoints.down('sm')]: {
                marginTop: 10
            },
        },
        courseListBlock: {
            marginTop: 73
        },
        courseList: {
            [theme.breakpoints.up('lg')]: {
                width: 720
            },
            [theme.breakpoints.only('md')]: {
                width: 535
            }
        },
        courseListItem: {
            margin: "0 0 20px 8px",
            fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            fontWeight: 900,
            fontSize: "11pt",
            lineHeight: 1.7,
            letterSpacing: 0
        },
        checkMarkLIIcon: {
            minWidth: 40,
            marginTop: 1
        },
        offer: {
            [theme.breakpoints.up('lg')]: {
                marginTop: 32
            },
            [theme.breakpoints.down('md')]: {
                flexDirection: "column",
                alignItems: "center",
                marginTop: 2
            },
        },
        textNearButtons: {
            ...font3,
            [theme.breakpoints.up('lg')]: {
                marginTop: 15
            },
            [theme.breakpoints.down('md')]: {
                marginBottom: 27
            },
        },
        studyFormats: {
            marginTop: 40
        },
        studyFormatsLI: {
            marginBottom: 20,
            fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
            fontWeight: 900,
            fontSize: "16pt",
        },
        studyFormatsList: {
            marginTop: 20
        },
        finishText: {
            margin: "20px 0 50px 0"
        }
    }
})

function Landing(props) {

    const {appData} = props
    const LandingWithUserProps = UserMode(LandingView)

    return <>
        <CssBaseline/>
        <ThemeProvider theme={getTheme()}>
            <ErrorBoundary module={"Landing"} method={"ErrorBoundary"}>
                <LandingWithUserProps profile={appData.profile} course={appData.content.course}/>
            </ErrorBoundary>
        </ThemeProvider>
    </>
}

function LandingView(props) {

    const {userModeProps, course} = props
    const {profile, onClick} = userModeProps
    const classes = useStyles()
    const centerTopPanel = <Hidden implementation={"css"} smDown>
        <Typography className={classes.barTitle} component="h1">
            {"Авторский курс "}<b>{"Николая Янчева"}</b>
        </Typography>
    </Hidden>

    const Buttons = () => (
        <Grid className={classes.buttonGroupWithShadow} container item direction="column" alignItems="center">
            {course && <>
                <Grid className={classes.buttonGroup} container item justify="center" alignItems={"center"}>
                    <CourseProgramButton className={classes.courseProgramButton}
                                         disableElevation
                                         size="large"
                                         variant="contained"
                                         id={course.id}
                                         alias={course.alias}
                                         heading={course.heading}/>
                    <CourseActivateButton className={classes.courseActivateButton}
                                          disableElevation
                                          size="large"
                                          variant="contained"
                                          alias={course.alias}
                                          underline={"none"}/>
                </Grid>
                <Grid container item justify="center">
                    <img className={classes.buttonShadow} src={"/images/landings/buttonShadow.png"} alt="тень кнопки"/>
                </Grid></>}
        </Grid>
    )

    const CheckMarkLIIcon = () => (
        <ListItemIcon className={classes.checkMarkLIIcon}>
            <SvgIcon viewBox="0 0 20 15" width="20pt" height="15pt">
                <defs>
                    <clipPath id="_clipPath_wRleZ9SOf8mXRbUdLnLdpFKIk7j4IOXW">
                        <rect width="20" height="15"/>
                    </clipPath>
                </defs>
                <g>
                    <path d=" M 1 8 L 9 13 L 18 2 L 18 2"
                          fill="none"
                          stroke="rgb(0,0,0)"/>
                </g>
            </SvgIcon>
        </ListItemIcon>
    )

    const LI = props => {
        const {children, className, secondary} = props
        return (
            <ListItem className={mergeClassName(classes.li, className)} disableGutters>
                <CheckMarkLIIcon/>
                <ListItemText className={classes.liText}
                              secondary={secondary}
                              primaryTypographyProps={{variant: "inherit"}}>
                    {children}
                </ListItemText>
            </ListItem>
        )
    }

    const FirstBlockLi = props => (
        <LI className={classes.firstBlockLI} {...props}/>
    )

    const Underline = props => (
        <Box className={mergeClassName(classes.underline, props.className)}/>
    )

    const P = props => (
        <Typography className={mergeClassName(classes.p, props.className)}
                    {...props}
                    component="p"/>
    )

    const Check = props => (
        <Grid className={classes.check} container item direction="column" component="li">
            <Grid className={classes.checkImageBox} container item alignItems="center" justify="center">
                <img src={`/images/landings/${props.imageName}.png`} alt={props.imageAlt}/>
            </Grid>
            <Grid className={classes.checkDescBox} container item justify="flex-end">
                <P className={classes.checkDesc} align="center">
                    {props.children}
                </P>
            </Grid>
        </Grid>
    )

    const CourseListItem = props => {
        const {children, title} = props
        return (
            <LI className={classes.courseListItem}
                variant="inherit"
                secondary={children}>
                {title}
            </LI>
        )
    }

    const StudyFormatsLI = props => {
        const {children, title} = props
        return (
            <LI className={classes.studyFormatsLI}
                secondary={children}>
                {title}
            </LI>
        )
    }

    const TextNearButtons = props => (
        <Typography className={classes.textNearButtons} component={"p"} align={"center"}>
            {props.children}
        </Typography>
    )

    const H2 = props => (
        <Typography className={mergeClassName(classes.p, props.className)}
                    align={props.align}
                    component="h2">
            {props.children}
        </Typography>
    )

    return <>
        <Hidden implementation={"css"} smDown>
            <img className={classes.leftAngle}
                 alt="блокнот на фоне"
                 src={`/images/landings/${course.alias}/leftAngle.png`}/>
        </Hidden>
        <Hidden mdUp>
            <img className={classes.smallLeftAngle} alt="блокнот на фоне" src={"/images/landings/smallLeftAngle.png"}/>
        </Hidden>
        <Hidden implementation={"css"} smDown>
            <img className={classes.blueBackground}
                 alt="голубой фон внизу страницы"
                 src={"/images/landings/blueBackground.png"}/>
        </Hidden>
        <MainTemplate profile={profile} onClick={onClick} centerChildren={centerTopPanel}>
            <Grid className={classes.firstBlock} container direction="column" alignItems="flex-end">
                <List disablePadding className={classes.firstList}>
                    <FirstBlockLi>
                        {"Нужны знания и практика"}
                        <br/>
                        {`для сдачи ЕГЭ по профильной математике?`}
                    </FirstBlockLi>
                    <FirstBlockLi>
                        {"Хотите сдать ЕГЭ на 80+?"}
                    </FirstBlockLi>
                    <FirstBlockLi>
                        {"Не готовы тратить большие"}
                        <br/>
                        {`деньги на репетиторов и разные курсы?`}
                    </FirstBlockLi>
                    <FirstBlockLi variant="caption" className={classes.firstBlockFinishLi}>
                        {"Выход есть!"}
                    </FirstBlockLi>
                </List>
                <Underline className={classes.firstBlockUnderline}/>
                <Grid className={classes.firstBlockTitle} container direction={"column"}>
                    <Typography className={classes.titleFirstString}
                                component={"h1"}
                                variant="inherit"
                                color="inherit"
                                align={"center"}>
                        <b>{"АВТОРСКИЙ КУРС "}</b>
                        <Typography component={"span"} variant={"inherit"} noWrap>{"Николая Янчева"}</Typography>
                    </Typography>
                    <Typography className={classes.titleSecondString}
                                component="h1"
                                variant="inherit"
                                color={"textPrimary"}>
                        {course.heading}
                    </Typography>
                </Grid>
            </Grid>
            <Grid className={classes.secondBlock} container direction="column" alignItems="center">
                <Buttons/>
                <Typography className={classes.textAfterButtons} component="p" align="center">
                    {course.desc}
                </Typography>
                <Typography className={classes.secondBlockTitle} component="h2" align="center">
                    {"ПОЧЕМУ Я и МОЙ АВТОРСКИЙ КУРС?"}
                </Typography>
                <Underline className={classes.secondBlockTitleUnderline}/>
                <Grid className={classes.checks} container item component="ul" justify="space-around">
                    <Check imageName="myPracticeCheck" imageAlt="мой опыт">
                        {"Почти 10 лет я"}<br/>готовлю учеников<br/>выпускных<br/>классов<br/>{"к сдаче ЕГЭ"}
                        <br/>{"по математике."}
                    </Check>
                    <Check imageName="myStudentsCheck" imageAlt="мои ученики">
                        {"Мои ученики"}<br/>сдают экзамен<br/>профильного<br/>уровня на<br/>80+<br/>{"баллов."}
                    </Check>
                    <Check imageName="myTaskCheck" imageAlt="моя задача">
                        {"Моя задача и"}<br/>задача курса<br/>направить ваши<br/>усилия в нужное<br/>
                        {"русло и привести"}<br/>{"вас к цели."}
                    </Check>
                </Grid>
                <Grid className={classes.price} container item justify={"space-between"} alignItems={"flex-start"}>
                    <img className={classes.priceImg} src={"/images/landings/250rub.png"} alt={"250 рублей"}/>
                    <Grid className={classes.priceDescBlock}
                          container
                          direction={"column"}
                          alignItems={"flex-start"}>
                        <H2 align={"left"}>
                            {"ПОЧЕМУ МОЙ "}<b>АВТОРСКИЙ</b>{" КУРС стоит "}
                            <Typography component={"span"} variant={"inherit"} noWrap>{"250 рублей?"}</Typography>
                        </H2>
                        <Underline className={classes.priceTitleUnderline}/>
                        <P className={classes.priceDesc} align={"left"}>
                            {"Считаю, что те, у кого ограничен бюджет в семье, тоже должны иметь возможность"}
                            <br/>{"прокачивать свои знания для поступления в хорошее учебное заведение."}
                        </P>
                    </Grid>
                </Grid>
                <Grid className={classes.courseListBlock} container justify={"space-around"} alignItems={"flex-start"}>
                    <Hidden implementation={"css"} smDown>
                        <img src={"/images/landings/studentOnBooks.png"}
                             alt={"иллюстрация: ученица на книжках с ноутбуком"}/>
                    </Hidden>
                    <List className={classes.courseList}>
                        <CourseListItem title={"Как построен курс и проходит процесс обучения?"}>
                            {"Весь курс контролирует система управления обучением, разработанная автором курса."}
                        </CourseListItem>
                        <CourseListItem title={"Курс разбит на темы привязанные к датам."}>
                            {"Каждая тема рассчитана на две недели обучения. В конце темы проводится итоговый вебинар."}
                        </CourseListItem>
                        <CourseListItem title={"В рамках каждый темы ученик получает доступ к видеоурокам."}>
                            {"К каждому видеоуроку дается самостоятельная работа, после выполнения которой ученик " +
                            "получает результаты и комментарии к каждому заданию и по работе в целом. Система " +
                            "позволяет перейти к очередному видеоуроку, только после успешной сдачи самостоятельной " +
                            "работы к предыдущему. В случае не успешной сдачи, ученик получает дополнительную " +
                            "самостоятельную работу по текущему видеоуроку."}
                        </CourseListItem>
                        <CourseListItem title={"Итоговый вебинар."}>
                            {"На итоговом вебинаре дополнительно рассмотрим примеры решений сложных заданий на " +
                            "пройденную тему и распространенные ошибки, допущенные при выполнении самостоятельных " +
                            "работ. Я отвечу на вопросы, возникшие в процессе обучения. Такой формат позволяет " +
                            "получить ответы на собственные вопросы, а также услышать ответы на вопросы других " +
                            "участников курса. Это поможет понять, осознать ошибки и не допускать их в дальнейшем."}
                        </CourseListItem>
                        <CourseListItem
                            title={"К курсу и к процессу учебы можно подключиться в любой момент и на " +
                            "любой теме."}/>
                    </List>
                </Grid>
                <Grid className={classes.offer} container justify={"center"} alignItems={"flex-start"}>
                    <TextNearButtons>Запишитесь <b>прямо сейчас</b></TextNearButtons>
                    <Buttons/>
                    <TextNearButtons>
                        {"и занимайтесь за "}
                        <Typography component={"span"} variant={"inherit"} noWrap><b>250р. в месяц</b></Typography>
                    </TextNearButtons>
                </Grid>
                <Grid className={classes.studyFormats}>
                    <H2 align={"center"}>ФОРМАТЫ ОБУЧЕНИЯ:</H2>
                    <List className={classes.studyFormatsList}>
                        <StudyFormatsLI title={"Видеоуроки"}>
                            {"На уроках разбираются примеры решения типовых задач."}
                        </StudyFormatsLI>
                        <StudyFormatsLI title={"Самостоятельные работы"}>
                            {"Самостоятельная работа составлена из заданий подходящих к теме предыдущего видеоурока. " +
                            "Работа проверяется преподавателем"}
                        </StudyFormatsLI>
                        <StudyFormatsLI title={"Итоговые вебинары"}>
                            {"Итоговый вебинар проводится один раз в две недели."}
                        </StudyFormatsLI>
                    </List>
                </Grid>
                <P className={classes.finishText} align={"center"}>
                    {"Если у вас остались вопросы, готов ответить. Я отвечаю на сообщения в мессенджерах WhatsApp и " +
                    "Viber  по номеру "}
                    <Typography component={"span"} variant={"inherit"} noWrap>+ 7 919 962 81 92</Typography>
                </P>
            </Grid>
        </MainTemplate>
    </>
}

export default Landing