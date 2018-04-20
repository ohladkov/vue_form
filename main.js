(() => {
  const form = document.getElementById('vue-form');

  if (!form) {
    return;
  }

  const invalidNicknames = ['god', 'devil', 'president'];

  VeeValidate.Validator.extend('nickname', {
    getMessage: field => `${field} can't be ${invalidNicknames.join(', ') + '!'}`,
    validate: value => new Promise((resolve, reject) => {
      resolve({
        valid: invalidNicknames.indexOf(value.toLowerCase()) === -1
      });
    })
  });


  const vueForm = new Vue({
    el: form,
    data() {
      return {
        input: {
          firstName: '',
          lastName: '',
          email: '',
          age: '',
          skype: '',
          hobbies: '',
          telephones: '',
          nickname: '',
        },
        users: [],
        step: 0,
        scopes: ['main', 'additional'],
      };
    },

    created: function () {
      this.getDataFromLocalStorage('users');
      this.getItems('users');
    },

    mounted: function() {
      document.getElementById('wrapper').style.opacity = 1;
    },

    methods: {
      addUser: function (scope) {
        this.$validator.validateAll(scope)
          .then((result) => {
            if ( !result ) {
              return;
            } else if ( result && this.step === this.scopes.length - 1 ) {
              const user = Object.assign({}, this.input);
              this.setItems(this.users, user);
              this.setDataToLocalStorage('users', this.users);
              this.step = 0;
              this.resetFields(this.input, this.scopes[this.step]);
            } else {
              this.nextStep();
            }
          });

        return this.users;
      },

      getItems: function (key) {
        if (this.getDataFromLocalStorage(key) === undefined) {
          return;
        }

        for (const item of this.getDataFromLocalStorage(key)) {
          this[key].push(item);
        }

        return this[key];
      },

      setItems: function (arr, key) {
        arr.push(key);
        return arr;
      },

      getDataFromLocalStorage: function (key) {
        if (window.localStorage.getItem(key) === null) {
          return;
        }
        const storageData = JSON.parse(window.localStorage.getItem(key));

        return storageData;
      },

      setDataToLocalStorage: function (key, obj) {
        window.localStorage.setItem(key, JSON.stringify(obj));
      },

      prevStep: function() {
        return this.step--;
      },

      nextStep: function() {
        return this.step++;
      },

      resetFields: function (obj, scope) {
        for (const key in obj) {
          obj[key] = '';
        }

        this.$nextTick(() => {
          this.$validator.errorBag.clear(scope);
        });
      },

      removeItem: function(e, key) {
        const row = e.target.parentElement.parentElement;
        const parentRow = row.parentElement;
        const rowIndex = [...parentRow.children].indexOf(row);

        this[key].splice(rowIndex, 1);

        if ( this[key].length ) {
          this.setDataToLocalStorage(key, this[key]);
        } else {
          window.localStorage.removeItem(key);
        }

        return this[key];
      },
    },
  });

})();