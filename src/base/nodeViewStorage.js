/**
 *
 *
 */
import * as THREE from 'three';

import NodeView from './nodeView';
import NodeViewStandard from './nodeViewStandard';
import NodeNameView from './nodeNameView';
import GlobalStyles from '../globalStyles';

const radius = 32;

class NodeViewStorage extends NodeViewStandard {
  constructor (service) {
    super(service);
  }

  getNameView () {
    return new NodeNameView(this, false);
  }

  setShape (service) {
    this.radius = radius;

    this.dotColor = GlobalStyles.getColorTrafficRGBA(this.object.getClass());
    this.dotMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.dotColor.r, this.dotColor.g, this.dotColor.b), transparent: true, opacity: this.dotColor.a });
    // this.meshes.outerBorder = this.addChildElement(new THREE.BoxGeometry(2 * radius, 2 * radius, 0), this.borderMaterial);
    // this.meshes.innerCircle = this.addChildElement(new THREE.BoxGeometry(1.8 * radius, 1.8 * radius, 0), this.innerCircleMaterial);

    /**/
    this.meshes.outerBorder = this.addChildElement(new THREE.BoxGeometry(1, 1, 0), this.borderMaterial);

    const dbshape = new THREE.Shape();
    const dx = -30;
    const dy = -30;

    dbshape.moveTo(dx + 4, dy + 0);
    dbshape.lineTo(dx + 56, dy + 0);
    dbshape.lineTo(dx + 60, dy + 8);
    dbshape.lineTo(dx + 60, dy + 12);
    dbshape.lineTo(dx + 56, dy + 18);
    dbshape.lineTo(dx + 56, dy + 22);
    dbshape.lineTo(dx + 60, dy + 28);
    dbshape.lineTo(dx + 60, dy + 32);
    dbshape.lineTo(dx + 56, dy + 38);
    dbshape.lineTo(dx + 56, dy + 42);
    dbshape.lineTo(dx + 60, dy + 48);
    dbshape.lineTo(dx + 60, dy + 52);
    dbshape.lineTo(dx + 56, dy + 60);
    dbshape.lineTo(dx + 4, dy + 60);
    dbshape.lineTo(dx + 0, dy + 52);
    dbshape.lineTo(dx + 0, dy + 48);
    dbshape.lineTo(dx + 4, dy + 42);
    dbshape.lineTo(dx + 4, dy + 38);
    dbshape.lineTo(dx + 0, dy + 32);
    dbshape.lineTo(dx + 0, dy + 28);
    dbshape.lineTo(dx + 4, dy + 22);
    dbshape.lineTo(dx + 4, dy + 18);
    dbshape.lineTo(dx + 0, dy + 12);
    dbshape.lineTo(dx + 0, dy + 8);
    dbshape.lineTo(dx + 4, dy + 0);
    const fillcolor = (this.provisioned) ? new THREE.Color('rgb(66, 165, 69)') : new THREE.Color('rgb(50, 50, 50)');
    this.meshes.innerCircle = this.addChildElement(new THREE.ShapeGeometry(dbshape, 12), new THREE.MeshBasicMaterial({ color: fillcolor, transparent: true, opacity: this.dotColor.a }));
    /**/

    this.meshes.noticeDot = this.addChildElement(NodeView.getNoticeDotGeometry(radius), this.dotMaterial);
  }

  setOpacity (opacity) {
    super.setOpacity(opacity);
    if (this.object.hasNotices()) {
      this.dotMaterial.opacity = opacity * this.dotColor.a;
    }
  }

  refreshNotices () {
    if (this.object.hasNotices()) {
      const noticeSeverity = this.object.highestNoticeLevel();
      this.dotColor = GlobalStyles.getColorSeverityRGBA(noticeSeverity);
      this.dotMaterial.color.setRGB(this.dotColor.r, this.dotColor.g, this.dotColor.b);
      this.dotMaterial.opacity = this.opacity * this.dotColor.a;
      this.meshes.noticeDot.geometry.colorsNeedUpdate = true;
    } else {
      this.dotMaterial.opacity = 0;
    }
  }

  refresh (force) {
    super.refresh(force);

    // Refresh severity
    if (this.highlight) {
      this.dotMaterial.color.set(this.donutInternalColor);
    } else {
      this.dotMaterial.color.setRGB(this.dotColor.r, this.dotColor.g, this.dotColor.b);
    }
    this.meshes.noticeDot.geometry.colorsNeedUpdate = true;

    // Refresh notices
    this.refreshNotices();
  }
}

export default NodeViewStorage;
