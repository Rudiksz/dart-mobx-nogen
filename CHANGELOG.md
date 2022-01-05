# Change Log

## 1.2.0

- **observable:** simplified the syntax to use less extra variables. For it to work MobX must be configured with `ReactiveWritePolicy.never`.
- **observablex**: the previous extended format that works with `ReactiveWritePolicy` enabled
- Simplified **computeds** and **actions** a bit further and removed the need for the extension on Mobx.  
    New Format:
    ```Dart
    //@action
    void doSomething(String value) => _doSomething([value]);
    late final _doSomething = Action((String value) {});
    //@-action

    //@computed
    String get something => _something.value;
    late final _something = Computed<String>(() {});
    //@-computed
    ```
- Custom mapper for the [CodeMap](https://marketplace.visualstudio.com/items?itemName=oleg-shilo.codemap) extension, that you can use for quick visualization of observables, computeds and actions. The extension must be installed and configured separately. You can find the mapper [here](src/codemap.mapper.js)


## 1.1.0

- **observable:** will create private "setter actions", to prevent them from showing in autocomplete list
- **computed:** create empty function body instead of throw. This will most likely result in compile error, so it should be hard to forget to implement them.
- **action:** actions would hide the function signature from the rest of the code. Added a public proxy function, for better dev experience at the cost of a bit of extra initial setup.
    New format:
    ```Dart
    //@action
    void doSomething(String value) => _doSomethingAction([value]);
    late final _doSomethingAction = _doSomething.action;
    void _doSomething(String value) {}
    //@-action
    ```
- Fixed some issues with region folding, when switching between files
- Resolve TS lint warnings
## 1.0.0

- Initial release