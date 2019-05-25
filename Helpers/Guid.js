// Simple typescript implementation of C# GUID/UUID system, proudly -> stolen <- from github.
// Had i made my own i would've used the current date/time stamp as it is always unique, and replaced some random letters here and there probably.
module.exports.newGuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
