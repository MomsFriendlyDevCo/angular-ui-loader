MFDC-loader
===========
Generic page loading control in plain JS + Angular, designed to be as small as possible.

[Demo available here](demo.html)


CSS classes
===========
The base CSS of this component supports the following CSS classes:

| CSS Class                    | Applied When       | Description                                                                                                       |
|------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------------|
| `loading`                    | Loading            | Applied to the `body` element during any loading operation                                                        |
| `loading-foreground`         | Foreground loading | Applied to the `body` element during a foreground loading operation                                               |
| `loading-background`         | Background loading | Applied to the `body` element during a background loading operation                                               |
| `hidden-loading`             | Loading            | Utility class which sets `display:none` to any element it is applied to when the page is in any loading operation |
| `hidden-loading-background`  | Background loading | As above but only for background loading events                                                                   |
| `hidden-loading-foreground`  | Foreground loading | As above but only for foreground loading events                                                                   |
| `visible-loading`            | Finished loading   | Utility class which sets items as visible when the page has finished any loading operation                        |
| `visible-loading-background` | Background loading | As above but for background loading events                                                                        |
| `visible-loading-foreground` | Foreground loading | As above but for foreground loading events                                                                        |


**NOTES:**

* Foreground and Background loading events are mutually exclusive. A `body` element will not have `loading-foreground` and `loading-background` applied at the same time.
* There are no "loaded" styles. If you want this behaviour use `not(body.loading)` instead.
