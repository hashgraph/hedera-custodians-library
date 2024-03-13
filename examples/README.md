# Hedera Custodians Integration Examples

This repository contains examples demonstrating the usage of the Hedera Custodians Library.

## Prerequisites

Before running the examples, make sure you have the following prerequisites installed:

- [Node.js](https://nodejs.org) (version 12 or higher)
- [npm](https://www.npmjs.com/) (Node package manager)
- (Optional) TSX can be executed with npx (`npm install -g tsx`)

## Running the Examples

1. Clone this repository:

```bash
git clone https://github.com/your-username/hedera-custodians-library.git
```

2. Navigate to the **root directory of the library** (if you are not there) and install the dependencies:

```bash
cd hedera-custodians-library
npm install
```

3. Configure the Environment variables ([explained here](../README.md#72-configuration))
4. Run an example:

```bash
tsx examples/index.ts
# OR
# It might ask you to install it the first time
npx tsx examples/index.ts
```

4. Input data interactively using console

## List of Examples

- HtsExample.ts: This example demonstrates how to interact with the Hedera Token Service from a custodial perspective.
- HscsExample.ts: This example demonstrates how to interact with the Hedera Smart Contract Service.
- HfssExample.ts: This example demonstrates how to interact with the Hedera File System Service.
- KeyListExample.ts: This example demonstrates how to use a custodial to perform operations using key lists.
- HcsExample.ts: This example demonstrates how to interact with the Hedera Consensus Service.

## Contributing

We welcome contributions! If you have an example you'd like to add, please open a pull request.

## Questions?

If you have any questions, please open an issue and we'll get back to you as soon as we can.
