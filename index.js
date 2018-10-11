const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let CommentWindow;
let commentMenu = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    //A linha de código abaixo fecha a aplicação quando o evento de fechamento da janela principal ocorrer
    mainWindow.on('closed', () => app.quit());

    //Este método reconhece o template como menu, porém não plota ele na tela
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    //Plota o menu na tela
    Menu.setApplicationMenu(mainMenu);
});

function createCommentWindow(){
    CommentWindow = new BrowserWindow({
        //Tanto altura quanto largura devem ser especificados em pixel
        width: 500,
        height: 300,
        title: 'Novo Comentário'
    });
    CommentWindow.loadURL(`file://${__dirname}/comment.html`);
    CommentWindow.on('closed', () => CommentWindow = null);
    if(process.platform !== 'darwin'){
        CommentWindow.setMenu(commentMenu);
    }
}

ipcMain.on('addComment', (event, comment) => {
    mainWindow.webContents.send('addComment', comment);
    CommentWindow.close();
});

const menuTemplate = [
    {
        label: 'Menu',
        submenu: [
            {
                label: 'Adicionar Comentário',
                click(){
                    createCommentWindow();
                }
            },
            {
                //Nome d opção do submenu
                label: 'Sair a Aplicação',
                accelerator: process.platform === 'win32' ? 'Alt+F4' : 'Cmd+Q',
                //Função a ser executada quando o usuário clicar no submenu
                click(){
                    app.quit();
                }
            }
        ]
    }
]

/*Este código visa corrigir um problema quando o projeto é executado no MacOS, 
que é o item do primeiro menu, então eu verifico se a plataforma é o MacOS, 
caso positivo eu adiciono um item em branco no template do menu. */

if(process.platform === 'darwin'){
    menuTemplate.unshift({});
}

/* No código abaixo estamos habilitando a ferramenta de desenvolvedor quando a aplicação
estiver no ambiente diferente de produção  */
if(process.env.NODE_ENV !== 'production'){

const devTemplate = {
    label: 'Dev',
        submenu: [
            {
                /*A propriedade role funciona como um atalho para ativar rapidamente 
                funcionalidades comuns disponíveis no menu, no site do electron existe uma
                lista com as roles disponíveis https://electronjs.org/docs/api/menu-item#roles*/
                role: 'reload'
            },
            {
                label: 'Debug',
                accelerator: process.platform === 'win32' ? 'Ctrl+Shift+I' : 'Cmd+Alt+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
        ]
};

    menuTemplate.push(devTemplate);

    if(process.platform !== 'darwin'){
        commentMenu = Menu.buildFromTemplate([devTemplate]);
    }
}