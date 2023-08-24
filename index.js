(() => {
	((ws) => {
		window.WebSocket = class extends ws {
			constructor(...args) {
				super(...args);
				listenWebSocket(this);
				chat.make();
			}
			send(data) {
				super.send(data);
				if (typeof data === 'string') {
					// JSON
					const arr = JSON.parse(data);
					if (arr[0] === 1) {
						chat.log('自分', arr[1]);
					}
				}
			}
		};
	})(window.WebSocket);

	const chat = new (class {
		constructor() {
			this.elm = document.createElement('div');
			Object.assign(this.elm.style, {
				position: 'fixed',
				left: '30vw',
				width: '40vw',
				height: '15vh',
				backgroundColor: 'rgba(0, 0, 0, 0.1)',
				overflow: 'auto',
				padding: '0.5em',
			});
			this.count = 0;
		}
		make() {
			document.body.append(this.elm);
		}
		async log(author, text) {
			const wrapper = document.createElement('div');
			Object.assign(wrapper.style, {
				backgroundColor:
					this.count++ % 2 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(63, 63, 63, 0.3)',
				color: `hsl(${await hash(author)} 100% 50%)`,
				padding: '0 0.5em',
			});
			const authorHolder = document.createElement('span');
			const textHolder = document.createElement('span');
			this.elm.append(wrapper);
			wrapper.append(authorHolder);
			wrapper.append(textHolder);
			authorHolder.innerText = `${author}: `;
			textHolder.innerText = `${text} (${now})`;
			this.elm.scrollTop = this.elm.scrollHeight;
		}
	})();

	const hash = (() => {
		const memo = new Map();
		return async (str) => {
			if (memo.has(str)) {
				return memo.get(str);
			} else {
				const hash = new Uint16Array(
					(
						await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
					).slice(0, 2),
				)[0];
				memo.set(str, hash);
				return hash;
			}
		};
	})();

	const now = {
		toString: () =>
			new Intl.DateTimeFormat('ja-JP', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}).format(new Date()),
	};

	const listenWebSocket = (ws) => {
		ws.addEventListener('message', (e) => {
			if (typeof e.data === 'string') {
				// JSON
				parseJSON(e.data);
			} else if (typeof e.data === 'object') {
				// ArrayBuffer
			}
		});
	};

	const parseJSON = (data) => {
		const arr = JSON.parse(data);
		switch (arr[0]) {
			case 0: {
				// chat
				const id = arr[1];
				const author = `${players.nicknames[id]}#${id}`;
				chat.log(author, arr[2]);
				break;
			}
			case 1: // new player
				players.join(arr[1], arr[3]);
				break;
			case 2: // nicknames token
				players.nicknames = arr;
				break;
			case 3: // alert
				break;
			case 4: // new team
				break;
			case 5: // team name
				break;
		}
	};

	const players = new (class {
		constructor() {
			this.nicknames = null;
		}
		join(id, nickname) {
			this.nicknames[id] = nickname;
		}
	})();
})();
