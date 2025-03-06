export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  follow(targetX, targetY, easing = 0) {
    this.x = lerp(this.x, targetX, easing);
    this.y = lerp(this.y, targetY, easing);
  }
}
