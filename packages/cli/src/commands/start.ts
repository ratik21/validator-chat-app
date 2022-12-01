import { pathHelp } from '../utils.js'
import os from 'os';
import fs from 'fs';
import path from 'path';
import enquirer from "enquirer";
import { P2PNode } from 'core';

interface NodeInitOpts {
  name: string,
  rest: {
    port: number
    address: string
  }
}

async function startNode(opts: NodeInitOpts): Promise<void> {
  const node = new P2PNode();
  await node.initialize(opts);
}

async function getNewName() {		
	const response = await enquirer.prompt({
		type: 'input',
		name: 'peerName',
		message: 'Please type a name for your node'
	});

	return (response as any).zIdName;
}

export default {
  command: 'start',

  describe: 'Initializes a p2p node to facilitate chatting b/w validators',

  /**
   * @param yargs
   */
  builder (yargs) {
    return yargs
      .epilog(pathHelp)
      .option('force', {
        type: 'boolean',
        desc: 'If true, REMOVES any previous config present at ~/.ringer',
        default: false
      })
      .option('name', {
        type: 'string',
        desc: 'Name of the node. If passed, this name is directly used to initialize the node',
      })
      // rest api options
      .option('restPort', {
        type: 'number',
        desc: 'Listen TCP port for the HTTP REST server',
				default: '9596'
      })
      .option('restAddr', {
        type: 'string',
        desc: 'Listen address for the HTTP REST server',
				default: '127.0.0.1'
      })
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   */
  async handler (argv) {
    // remove existing config if --force is passed
    if (argv.force) {
      fs.rmSync(path.join(os.homedir(), '/.ringer'), {force: true, recursive: true});
    }

		let name: string;
		if (argv.name !== undefined) {
			name = argv.name;
		} else {
			const basePath = path.join(os.homedir(), '.ringer', 'peerId');
			if (!fs.existsSync(basePath)) {
				name = await getNewName();
			} else {
				const names = fs
					.readdirSync(basePath, { withFileTypes: true })
					.filter((dirent) => (!dirent.isDirectory() && dirent.name.endsWith('.json')))
					.map((dirent) => dirent.name.split('.json')[0]);

				if (names.length === 0) {
					name = await getNewName();
				} else {
					const choicePrompt = new (enquirer as any).Select({
						name: "Choose",
						message: "Existing node configuration found at ~/.ringer/peerId",
						choices: ["Load from an existing node", "Initialize a new node"],
					});

					const selectedChoice = await choicePrompt.run();
					if (String(selectedChoice).startsWith('Initialize')) {
						name = await getNewName();
					} else {
						const namePrompt = new (enquirer as any).Select({
							name: "Nodes",
							message: "Pick a node to load",
							choices: names,
						});
						name = await namePrompt.run();
					}
				}
			}
		}

    await startNode({ 
			name: argv.name, 
			rest: { port: argv.restPort, address: argv.restAddr } 
		});
  }
}
