function disconnected() {
  var notObserving = true;
  var observer = null;
  return function observe(node) {
    if (notObserving) {
      notObserving = !notObserving;
      observer = new WeakSet();
      startObserving(node.ownerDocument);
    }
    observer.add(node);
    return node;
  };
  function startObserving(document) {
    var connected = new WeakSet();
    var disconnected = new WeakSet();
    new MutationObserver(changes).observe(document, {
      subtree: true,
      childList: true
    });
    function changes(records) {
      for (var record, length = records.length, i = 0; i < length; i++) {
        record = records[i];
        dispatchAll(
          record.removedNodes,
          "disconnected",
          disconnected,
          connected
        );
        dispatchAll(record.addedNodes, "connected", connected, disconnected);
      }
    }
    function dispatchAll(nodes, type, wsin, wsout) {
      for (
        var node, event = new CustomEvent(type), length = nodes.length, i = 0;
        i < length;
        (node = nodes[i++]).nodeType === 1 &&
        dispatchTarget(node, event, type, wsin, wsout)
      );
    }
    function dispatchTarget(node, event, type, wsin, wsout) {
      if (observer.has(node) && !wsin.has(node)) {
        wsout.delete(node);
        wsin.add(node);
        node.dispatchEvent(event);
        /*
        // The event is not bubbling (perf reason: should it?),
        // hence there's no way to know if
        // stop/Immediate/Propagation() was called.
        // Should DOM Level 0 work at all?
        // I say it's a YAGNI case for the time being,
        // and easy to implement in user-land.
        if (!event.cancelBubble) {
          var fn = node['on' + type];
          if (fn)
            fn.call(node, event);
        }
        */
      }
      for (
        var // apparently is node.children || IE11 ... ^_^;;
          // https://github.com/WebReflection/disconnected/issues/1
          children = node.children || [],
          length = children.length,
          i = 0;
        i < length;
        dispatchTarget(children[i++], event, type, wsin, wsout)
      );
    }
  }
}
export default disconnected;
