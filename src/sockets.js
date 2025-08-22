import { Server } from 'socket.io';

export function registerSockets(httpServer) {
    const io = new Server(httpServer);

    io.on('connection', async (socket) => {
        console.log('cliente conectado');

        socket.emit('products', await listProducts());

    socket.on('createProduct', async (data, cb) => {
        console.log('[WS] createProduct data:', data);
        try {
            const created = await createProduct(data);
            console.log('[WS] created:', created);
            io.emit('products', await listProducts());
            cb && cb({ ok: true, created });
        } catch (e) {
            console.error('[WS] error:', e);
            cb && cb({ ok: false, error: e.message });
        }
    });
    });
}
