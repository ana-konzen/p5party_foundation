# Notes

Keep some notes!

# Code Review

# considering

### store items as object?

    storing items as {id: {}, ...} might be better on the wire
    removing an item from the object should send O(1) data
    removing an item from early in the array might be sending O(n) data
    maybe keep items in a shared object accessed only by item.js (as host)
    it could abstract the details of how they are stored

### hide .remove'd objects before sweep?

itemsByType might filter out items marked .remove currently items aren't actually removed until the end of the hostframe
would also want to avoid accessing shared.items directly, in favor of itemsByType() or allItems(). This would tie into hiding shared.itmes in item.js (see above)

# p5.party ideas

- readonly shared object refs
