class Chat {
    private title: string;
    private msgs: string = '';
    constructor(title: string) {
        this.title = title
    }
    setTitle(title: string) {
        this.title = title;
    }
    add(msg: string) {
        this.msgs += msg + 'EOS ';
    }
}

export default class Chats {
    private chats: Chat[] = [];
    constructor() {
        this.chats.push(new Chat('New Chat'));
    }

}