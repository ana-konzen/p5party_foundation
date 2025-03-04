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

- support for OOP. this has come up before. the test_class demo shows that using setPrototypeOf does seem to work for some situations. There are going to be some limitations. For one, no private properties. For another, it won't work for objects that store references to other objects (especially not references to things that are not (and should not be) stored). Both of these could sort of be worked around sometimes with serialize/deserialize methods for classes that are shared but then its getting complex anyway.
- might be able to "promote" in the patchInPlace funciton of p5.party

- the weakmap for local player data is okay, but i think it could be handled even better with "local unshared properties". like if p5.party didn't sync anything starting underscore .\_xyz or on .local.xyz
