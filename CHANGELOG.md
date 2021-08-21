# Change Log

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