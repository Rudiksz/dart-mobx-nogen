# Dart MobX

## Features

* Foldable regions. Wrap a section of code between region tags to create foldable regions. These are folded by default when opening a file.
    - `//@observable` ... `//@-observable`
    - `//@computed` ... `//@-computed`
    - `//@action` ... `//@-action`

    - Unfolded ![Unfolded Regions](images/fold-before.png)
    - Folded ![Folded regions](images/fold-after.png)

* Snippets to quickly create the boilerplate for observables, computed fields and actions
    ![snippets](images/snippets.gif)

## Requirements
   Add the below extension to your project and import in the your "Store" files, for computeds and actions to work.

   ```Dart
    typedef T ComputedFn<T>();
    extension MobxFunctionExtension on Function {
        Action get action => Action(this);
        Computed<T> computed<T>() => Computed<T>(this as ComputedFn<T>);
    }
``` 

## ROADMAP
* Improve toggle feature
* Option to exclude computed fields and actions when folding all regions

## Release Notes

### 1.0.0
Initial release
