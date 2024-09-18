export interface AppsSelectIA {
    app:     number;
    value:   string;
    waiting: waitingOpc[];
}

export interface waitingOpc {
    value: number;
    name:  string; 
}