export class CompositeTargetField {
  constructor(fieldResolver) {
    this.fieldResolver = fieldResolver;
  }

  getFields() {
    const fields = this.fieldResolver?.();
    return Array.isArray(fields) ? fields.filter(Boolean) : [];
  }

  findAt(x, y, radiusName) {
    for (const field of this.getFields()) {
      const target = field.findAt?.(x, y, radiusName);
      if (target) return { ...target, ownerField: field };
    }
    return null;
  }

  getPublicTargets(gameWidth, gameHeight) {
    return this.getFields().flatMap((field) => (
      field.getPublicTargets?.(gameWidth, gameHeight) || []
    ));
  }

  selectTarget(target) {
    target?.ownerField?.selectTarget?.(target);
  }

  destroy() {
    this.fieldResolver = null;
  }
}
