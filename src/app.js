/*
Contact

 - data{
    title
    content
    ...
    color
 }

 - edit({})
 - get()
*/



class User {
    data = {};
    constructor (dataNote) {
    if (!dataNote) return;
    if (!dataNote.name || !dataNote.phone) return;
    if (dataNote.name) this.data.name = dataNote.name;
    if (dataNote.phone) this.data.phone = dataNote.phone;
    
    }

    edit(dataNote) {
        if (!dataNote) return;
        if (dataNote.name !== undefined && 
            dataNote.phone !== undefined &&
            dataNote.name.length == 0 &&
            dataNote.phone.length == 0
        ) return;
        
        this.data = {...this.data, ...dataNote};
    };

    get() {
        //console.log(this.data)
        return this.data;
    }

}



/*
Contacts

 - data[{id, ... }, {}, {}]

 - add()
 - edit(id, {})
 - remove(id)
 - get()
*/



class Contacts {
   
    data = [];
    lastId = 0;

    add (dataNote) {
        
        const note = new User(dataNote);
        if(!note || !note.get) return;
        const noteKeys = Object.keys(note.get());
        

        if (noteKeys.length == 0) return;
        this.lastId++;
       
        note.id = this.lastId;
        this.data.push(note);
        
    };

    edit (id, dataNote) {
        if (!id) return;

        const note = this.data.find(item => item.id == id);

        if (!note) return;

        note.edit(dataNote);
    };

    remove (id) {
        if (!id) return;

        const newData = this.data.filter(item => item.id != id);
        
        this.data = newData;
    };

    get (id, print = false) {
        if (id > 0) {
            const note = this.data.find(item => item.id == id);

            if (note) {
                return print ? note.get() : note;
            }
        }
        else if(id == 0 && print){
            this.data.forEach(item => console.log(item.get()));
            return;
        }

        return this.data;
    }
};

const contacts = new Contacts();


/*
ContactsUI
*/

class ContactsUI extends Contacts {
        data = [];
        
        contactFormElem = null;
        contactListElem = null;
        contactInputName = null;
        contactInputPhone = null;
        formEditElem = null;
        rootElem = null

        editId = null;

        constructor () {
            super();
            this.init('root');
            this.update();
        };


        onRemove(event, id){
            this.remove(id);
            this.update();
        }


        onAdd() {
            if (!this.contactInputName || 
                !this.contactInputPhone ||
                this.contactInputName.value.length == 0 ||
                this.contactInputPhone.value.length == 0) return;
                
            
            this.add({
                name: this.contactInputName.value,
                phone: this.contactInputPhone.value
            });

            console.log(this.data);

            this.contactInputName.value = '';
            this.contactInputPhone.value = '';
    
            this.update();
        };

        update() {
            this.contactListElem.innerHTML = '';
            this.data.forEach(note => {
                let id = note.id;
                note = note.get();
    
                this.contactElem = document.createElement('li');
                this.contactElem.classList.add('contact');

                this.contactBtns = document.createElement('div');
                this.contactBtns.classList.add('contact_btns')

                this.contactCloseElem = document.createElement('button');
                this.contactCloseElem.classList.add('contact__remove');
                this.contactCloseElem.innerHTML = '+';

                this.contactEditElem = document.createElement('button');
                this.contactEditElem.classList.add('contact__edit');
                this.contactEditElem.innerHTML = 'Edit';

                if (note.name) this.contactElem.innerHTML = `<h3 class="note__title">${note.name}</h3>`;
    
                if (note.phone) this.contactElem.innerHTML += `<div class="note__content">+${note.phone}</div>`;
                
                this.contactBtns.append(this.contactEditElem, this.contactCloseElem);
                this.contactElem.append(this.contactBtns);
                this.contactListElem.append(this.contactElem);
    
                this.contactCloseElem.addEventListener('click', (event) => {
                    this.onRemove(event, id);
                });

                this.contactEditElem.addEventListener('click', () => {
                    this.onEdit(id);
                });
            });

            this.setStorage();
        };

        getCookie(name) {
            let matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }
    
        setCookie(name, value, options = {}) {
            options = {
                path: '/',
                ...options 
            };
        
            if (options.expires instanceof Date) { 
                options.expires = options.expires.toUTCString();
            }
             
            let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        
            for (let optionKey in options) { updatedCookie += "; " + optionKey;
             
            let optionValue = options[optionKey];
        
            if (optionValue !== true) { 
                updatedCookie += "=" + optionValue; 
            }
        }
            document.cookie = updatedCookie; 
        }

        setStorage() {
            this.dataTmp = this.data.map(item => {
                return {...{ id: item.id }, ...item.get()}
            });
            this.dataJson = JSON.stringify(this.dataTmp);
            if(!this.dataJson) return;
            localStorage.setItem('info', this.dataJson)
            
            if(this.dataJson && this.dataJson != '[]') this.setCookie('dataExp', '1', {"max-age": 864000});
        };


        getStorage() {
            this.dataTmp = localStorage.getItem('info');
            this.dataTmp = JSON.parse(this.dataTmp);
            if(!this.dataTmp) return;
            this.dataTmp.forEach(item => {
                delete item.id;
                this.add(item)})
        };

        getData() {

            fetch('https://jsonplaceholder.typicode.com/users')
            .then(response => { 
                if(response.status == 200) return response.json();
            })
            .then(body => { 
                if(body && body.length > 0) {
                    let dataTmp = body.map(item => {
                        return {
                            name: item.name,
                            phone: item.phone,
                        };
                    })
    
                    dataTmp.forEach(item => {
                        this.add(item);
                    });
    
                    this.update();
                }
            });
        };
    

        onEdit(id) {
            const contact = this.get(id, true);
            if(!contact) return;

            if (this.formEditElem) {
                this.formEditElem.remove();
            }; 

            this.formEditElem = document.createElement('div');
            this.formEditElem.classList.add('contact__form_edit');

            this.nameEditElem = document.createElement('div');
            this.nameEditElem.classList.add('name__form_edit');
            this.nameEditElem.innerHTML = contact.name;
            this.nameEditElem.contentEditable = 'true';

            this.phoneEditElem = document.createElement('div');
            this.phoneEditElem.classList.add('phone__form_edit');
            this.phoneEditElem.innerHTML = contact.phone;
            this.phoneEditElem.contentEditable = 'true';

            this.btnFormSave = document.createElement('button');
            this.btnFormSave.classList.add('btnsave__form_edit');
            this.btnFormSave.innerHTML = 'Save';

            this.btnFormClose = document.createElement('button');
            this.btnFormClose.classList.add('btnclose__form_edit');
            this.btnFormClose.innerHTML = '+';

            this.formEditElem.append(this.nameEditElem, this.phoneEditElem, this.btnFormSave, this.btnFormClose);
            document.body.append(this.formEditElem);

            this.btnFormClose.addEventListener('click', () => this.formEditElem.remove());
            this.btnFormSave.addEventListener('click', (event) => this.onSave(event, id, this.nameEditElem, this.phoneEditElem ));
            
        };

        onSave(event, id, nameEditElem, phoneEditElem ) {
            if(!this.nameEditElem || !this.phoneEditElem) return;

            this.editId = id;
            const name = this.nameEditElem.innerHTML;
            const phone = this.phoneEditElem.innerHTML;
            this.contact = this.get(this.editId);
            if (!this.contact) return;

            this.contact.edit({
                name: name,
                phone: phone
            }) 

            this.editId = null;
            this.formEditElem.remove();
            this.update();

        };
            
        init(Id) {
            // this.data = [];
           
            this.dataExp = this.getCookie('dataExp');
            if(!this.dataExp) {
                localStorage.removeItem('info');
            }

            this.getStorage();

            if (this.get().length == 0) this.getData();

           
            console.log(this.data);
            // this.data = this.get();

            const rootElem = document.querySelector('#'+ Id);
            if (!rootElem) return;
            this.contactFormElem = rootElem.querySelector('.contact__form');
            this.contactListElem = rootElem.querySelector('.contact__list');

            if(!this.contactFormElem || !this.contactListElem) return;
            this.contactInputName = document.createElement('input');
            this.contactInputName.name ='input__name';
            this.contactInputName.type = 'text';
            this.contactInputName.placeholder = 'Enter Name';

            this.contactInputPhone = document.createElement('input');
            this.contactInputPhone.name = 'input__phone';
            this.contactInputPhone.type = 'number';
            this.contactInputPhone.placeholder = 'Enter Phone';
            this.contactInputPhone.maxlength = '14';
            
            this.contactFormBtn = document.createElement('button');
            this.contactFormBtn.innerHTML ='+';
            this.contactFormBtn.classList.add('input__btn');

            this.contactFormElem.append(this.contactInputName, this.contactInputPhone, this.contactFormBtn);
            this.contactFormBtn.addEventListener('click', (event) => {
                this.onAdd(event)});
            this.update();
           
        }

};


new ContactsUI();




