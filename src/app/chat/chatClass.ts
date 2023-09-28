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
        for(let i = 0; i < titles.length; i++) {
            const chat = new Chat(titles[i]);
            chat.set(chats[i]);
            chat.setId(ids[i])
            this.chats.push(chat);
        }
    }
    add(index: number, msg: string) {
        this.chats[index].add(msg);
    }
    get(index: number): string {
        return this.chats[index].getMsgs();
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
}