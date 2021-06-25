export function graduationAfterNumerals(number, quantities) {
    const numberMod10 = number % 10;
    if (((numberMod10 >= 5) && (numberMod10 <= 9)) || (numberMod10 === 0) || ((numberMod10 >= 11) && (numberMod10 <= 14))) {
        return number + " " + quantities[2]
    } else if ((numberMod10 === 1)) {
        return number + " " + quantities[0]
    } else {
        return number + " " + quantities[1]
    }
}