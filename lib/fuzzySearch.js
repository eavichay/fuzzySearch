let maximumAcceptableList = Infinity;

const breakToPairs = (expression, useLowerCase = false) => {
    const string = useLowerCase ? expression.toLowerCase() : expression;
    const length = string.length - 1;
    const result = new Array(string.length - 1);
    for (let i = 0; i <= length; i++) {
        result[i] = string.slice(i, i + 2);
    }
    return result;
};

const calcSimilarity = (str1, str2) => {
    // compare every pairs of characters (or single) between two strings.
    // add score when a character is on both strings
    // add extra score if the character's position is close to the compared string
    // add score when character pairs are on both strings
    let score = 0;
    if (str1.length > 0 && str2.length > 0) {
        let tempIndex = 0;
        const pairs1 = breakToPairs(str1);
        const pairs2 = breakToPairs(str2);
        const union = pairs1.length + pairs2.length;

        // character exists
        pairs1.forEach((pair) => {
            if (str2.toLowerCase().indexOf(pair) >= 0) {
                score++;
            }
        });

        // distance position
        str1.split('').forEach((char, index) => {
            // every character that is close to the same character on the comparison get's a score
            const inIndex = str2.toLowerCase().indexOf(char);
            if (inIndex >= tempIndex) {
                score += 0.5 * ( union - ( inIndex - index ) );
                tempIndex = inIndex;
            }
        });

        // character pairs matching
        pairs1.forEach((pair1) => {
            const x = pair1;
            pairs2.forEach((pair2) => {
                const y = pair2;
                if (x === y) {
                    score++;
                }
            });
        });
        if (score > 0) {
            return score / union;
        }
    }
    return 0;
};

/**
 * 
 * @param {String} search Query/search term
 * @param {Array<any>} list Data set
 * @param {String} property? Required when items in list are objects
 * @param {Number} maxResults? Optional limit for filtered results
 * @returns {{item: any, score: Number}[]}
 */
export default function fuzzySearch (search, list, property = undefined, maxResults = Infinity) {
    if (maximumAcceptableList > list.length) {
        throw new Error(`Cannot accept list longer than ${maximumAcceptableList}`);
    }
    if (!search) {
        const limit = Math.min(maxResults, list.length);
        const result = [];
        for (let i = 0; i < limit; i++) {
            result.push({item: list[i], score: 0});
        }
        return result;
    }
    return list.map((item) => {
        let lookup = property ? item[property] : item;
        lookup = lookup.replace('/', '');
        const relevance = calcSimilarity(search, lookup);
        return {
            item: item,
            score: relevance
        };
    }).sort((a, b) => {
        if (a.score === b.score) {return 0;}
        return a.score < b.score ? 1 : -1;
    }).slice(0, maxResults);
}

export const limitInputSize(value = Infinity) {
    maximumAcceptableList = value;
}
