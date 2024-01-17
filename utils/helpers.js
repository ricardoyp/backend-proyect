module.exports = {
    endsWith: function(str, suffix) {
        return str.endsWith(suffix);
    },

    formatDate: function(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
    }
};