# Notes

Keep some notes!

# Code Review

current item flags:

- alive - crates | treasures
- blocking - doors
- hits - special to crates
- targets - special to floorSwitch

treasures block pushing always
crates block pushing always and walking sometimes (based on other side)
doors block pushing sometimes + walking sometimes (simple state)

considering:
storing items as {id: {}, ...} might be better on the wire
removing an item from the object should send O(1) data
removing an item from early in the array might be sending O(n) data

maybe keep items in a shared object accessed only by item.js (as host)
it could abstract the details of how they are stored

filterItems should maybe only return alive items
maybe unalive items should be just removed. get rid of the flag altogether.

zombie crates aren't a huge problem because crates aren't spawned during play
but bullets ARE....

# p5.party ideas

- readonly shared object refs
