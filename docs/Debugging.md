# Query debugging

If you wish to see what queries `monk` passes to the driver, simply leverage
[debug](http://github.com/visionmedia/debug):

```bash
DEBUG="monk:queries"
```

To see all debugging output:

```bash
DEBUG="monk:*"
```
