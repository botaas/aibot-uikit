# Official React SDK for [OneChat](https://openbot.chat/chat/sdk/react/)

<p align="center">
  <a href="https://openbot.chat/chat/react-chat/tutorial/"><img src="https://i.imgur.com/SRkDlFX.png" alt="react native chat" width="60%" /></a>
</p>

> The official React components for OneChat, a service for
> building chat applications.

[![NPM](https://img.shields.io/npm/v/one-chat-react.svg)](https://www.npmjs.com/package/one-chat-react)
[![build](https://github.com/botaas/aibot-uikit/workflows/test/badge.svg)](https://github.com/botaas/aibot-uikit/actions)
[![Component Reference](https://img.shields.io/badge/docs-component%20reference-blue.svg)](https://openbot.chat/chat/docs/sdk/react/)
[![codecov](https://codecov.io/gh/GetStream/one-chat-react/branch/master/graph/badge.svg)](https://codecov.io/gh/GetStream/one-chat-react)

**Quick Links**

- [Register](https://openbot.chat/chat/trial/) to get an API key for OneChat
- [React Chat Tutorial](https://openbot.chat/chat/react-chat/tutorial/)
- [Demo Apps](https://openbot.chat/chat/demos/)
- [Component Docs](https://openbot.chat/chat/docs/sdk/react/)
- [Chat UI Kit](https://openbot.chat/chat/ui-kit/)
- [Internationalization](#internationalization)

With our component library, you can build a variety of chat use cases, including:

- Livestream like Twitch or YouTube
- In-game chat like Overwatch or Fortnite
- Team-style chat like Slack
- Messaging-style chat like WhatsApp or Facebook's Messenger
- Customer support chat like Drift or Intercom

## React Chat Tutorial

The best way to get started is to follow the [React Chat Tutorial](https://openbot.chat/chat/react-chat/tutorial/). It shows you how to use this SDK to build a fully functional chat application and includes common customizations.

## Free for Makers

OneChat is free for most side and hobby projects. To qualify, your project/company must have no more than 5 team members and earn less than $10k in monthly revenue.
For complete pricing and details visit our [Chat Pricing Page](https://openbot.chat/chat/pricing/).

## Installation

### Install with NPM

`npm install react react-dom one-chat one-chat-react`

### Install with Yarn

`yarn add react react-dom one-chat one-chat-react`

### Install via CDN

```
<script src="https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/one-chat"></script>
<script src="https://cdn.jsdelivr.net/npm/one-chat-react"></script>
```

## Example Apps

We have built five demo applications showcasing a variety of chat use cases, including social messaging, team collaboration, customer support, livestream gaming, and virtual event. You can preview these [demos](https://openbot.chat/chat/demos/) on our website. Also, the code is [open source](https://github.com/GetStream/website-react-examples/).

## Docs

We use a doc generator to build our [component documentation](https://openbot.chat/chat/docs/sdk/react/). We provide a brief description of each chat component and define all of the props it accepts.

##  TypeScript Support

As of version `5.0.0`, the component library has been converted to TypeScript. Please read the [TypeScript guide](https://github.com/botaas/aibot-uikit/wiki/Typescript-support) for details and implementation assistance.

##  Component Reusability

For components that implement significant logic, it's helpful to split the component into two parts: a top-level component which handles functionality and a lower level component which renders the UI. This way you can swap UI without altering the logic that gives the component its functionality. We use this provider/consumer pattern frequently in the library, and the below example shows how to swap out the `Message` UI component with `MessageTeam`, without affecting any logic in the app.

```jsx
<Channel Message={MessageTeam}>
  <Window>
    <ChannelHeader />
    <MessageList />
    <MessageInput />
  </Window>
  <Thread />
</Channel>
```

### Customizing Styles

The preferred method for overriding the pre-defined styles in the library is to two step process. First, import our bundled CSS into the file where you instantiate your chat application. Second, locate any OneChat styles you want to override using either the browser inspector or by viewing the library code. You can then add selectors to your local CSS file to override our defaults. For example:

```js
import '@stream-io/stream-chat-css/dist/css/index.css';
import './App.css';
```

## Internationalization

Our library supports auto-translation for various user languages. Please read our internationalization [documentation](https://openbot.chat/chat/docs/sdk/react/customization/translations/) for further details and setup guidance.

## Contributing

We welcome code changes that improve this library or fix a problem. Please make sure to follow all best practices and add tests, if applicable, before submitting a pull request on GitHub. We are pleased to merge your code into the official repository if it meets a need. Make sure to sign our [Contributor License Agreement (CLA)](https://docs.google.com/forms/d/e/1FAIpQLScFKsKkAJI7mhCr7K9rEIOpqIDThrWxuvxnwUq2XkHyG154vQ/viewform) first. See our license file for more details.

## We are hiring!
Our APIs are used by more than a billion end-users, and by working at OpenBot, you have the chance to make a huge impact on a team of very strong engineers.

Check out our current openings and apply via [OpenBot's website](https://openbot.chat/team/#jobs).
