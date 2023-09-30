class Chat {
    private title: string;
    private msgs: string = '';
    private id: string = '-1';
    constructor(title: string) {
        this.title = title
    }
    getTitle() {
        return this.title;
    }
    setTitle(title: string) {
        this.title = title;
    }
    add(msg: string) {
        this.msgs += msg + 'EOS ';
    }
    set(chat: string) {
        this.msgs = chat;
    }
    getMsgs() {
        return this.msgs;
    }
    setId(id: string) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
}

export default class Chats {
    private chats: Chat[] = [];
    constructor() {
        this.chats.push(new Chat('New Chat'));
    }
    init(titles: string[], chats: string[], ids: string[]) {
        const errs = [false];
        const pres = ['']
        for(let i = 0; i < titles.length; i++) {
            const chat = new Chat(titles[i]);
            chat.set(chats[i]);
            chat.setId(ids[i])
            this.chats.push(chat);
            errs.push(false);
            pres.push('')
        }
        return {errs: errs, pres: pres};
    }
    add(index: number, msg: string) {
        this.chats[index].add(msg);
    }
    get(index: number) {
        const msgs = this.chats[index].getMsgs().split(' EOS ');
        msgs.pop();
        let rvalue = [];
        for (let i = 0; i < msgs.length - 1; i++) {
            rvalue.push({text: msgs[i], isLast: false});
        }
        if (msgs.length) {
            rvalue.push({text: msgs[msgs.length - 1], isLast: true});
        }
        return rvalue;
    }
    getString(index: number) {
        return this.chats[index].getMsgs();
    }
    getAll() {
        let msgs: string[] = [];
        this.chats.forEach((chat) => {
            msgs.push(chat.getMsgs());
        })
        return msgs;
    }
    set(index: number, chat: string) {
        return this.chats[index].set(chat);
    }
    getTitle(index: number) {
        return this.chats[index].getTitle();
    }
    getTitles() {
        const titles: string[] = [];
        this.chats.forEach((chat) => {titles.push(chat.getTitle())})
        return titles;
    }
    setTitle(index: number, title: string) {
        this.chats[index].setTitle(title);
    }
    getRange() {
        let range: number[] = [];
        for (let i = 0; i < this.chats.length; i++) {
            range.push(i);
        }
        return range;
    }
    getArray() {
        let array = [];
        for (let i = 0; i < this.chats.length; i++) {
            array.push({title: this.chats[i].getTitle(), index: i});
        }
        return array;
    }
    getLength(): number {
        return this.chats.length;
    }
    getId(index: number) {
        return this.chats[index].getId();
    }
    getIds() {
        let ids: string[] = [];
        this.chats.forEach((chat) => {
            ids.push(chat.getId());
        })
        return ids;
    }
}