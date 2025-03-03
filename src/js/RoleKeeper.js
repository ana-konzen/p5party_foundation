export class RoleKeeper {
  #roles;
  #unassigned;
  #guests;
  #me;
  #boundUpdate; // holds a bound version of the update function

  constructor(roles = [1, 2], unassigned = "unassigned") {
    if (roles.length < 1) console.error("RoleKeeper: You must have at least one role!");

    this.#roles = roles;
    this.#unassigned = unassigned;
    this.#guests = partyLoadGuestShareds();
    this.#boundUpdate = this.#update.bind(this);
    this.#me = partyLoadMyShared(undefined, () => {
      this.#me._roleKeeper = { role: unassigned };

      this.#boundUpdate();
    });
  }

  myRole() {
    return this.#me._roleKeeper.role;
  }

  #update() {
    requestAnimationFrame(this.#boundUpdate);

    // loop through roles and assign them if needed
    this.#roles.forEach((role) => {
      // if there isn't any guest currently in this role...
      if (!this.#guests.find((g) => g._roleKeeper?.role === role)) {
        // find first unassigned guest...
        const guest = this.#guests.find((g) => g._roleKeeper?.role === this.#unassigned);
        // if that unassigned guest is me, take on the role
        if (guest === this.#me) guest._roleKeeper.role = role;
      }
    });
  }
}
