/**
 * Convert to slug
 * @param Text
 * @returns {string}
 */
function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}