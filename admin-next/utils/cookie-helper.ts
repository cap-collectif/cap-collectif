const Cookie = {
    getDateDifference: (day?: number, month?: number, year?: number): Date => {
        const dateUpdated = new Date();

        if (day) dateUpdated.setDate(dateUpdated.getDate() + day);
        if (month) dateUpdated.setMonth(dateUpdated.getMonth() + month);
        if (year) dateUpdated.setFullYear(dateUpdated.getFullYear() + year);

        return dateUpdated;
    },
};

export default Cookie;
