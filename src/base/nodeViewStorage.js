/**
 *
 *
 */
import * as THREE from 'three';

import NodeView from './nodeView';
import NodeViewStandard from './nodeViewStandard';
import NodeNameView from './nodeNameView';
import GlobalStyles from '../globalStyles';

const radius = 16;

class NodeViewStorage extends NodeViewStandard {
  constructor (service) {
    super(service);

    this.setShape(service);
    this.refreshNotices();

    // Add the service name
    this.nameView = this.getNameView();
    this.showLabel(this.object.options.showLabel);
  }

  getNameView () {
    return new NodeNameView(this, false);
  }

  setShape (service) {
    this.radius = radius;

    this.dotColor = GlobalStyles.getColorTrafficRGBA(this.object.getClass());
    this.dotMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.dotColor.r, this.dotColor.g, this.dotColor.b), transparent: true, opacity: this.dotColor.a });

    this.meshes.outerBorder = this.addChildElement(NodeView.getOuterBorderGeometry(radius), this.borderMaterial);
    this.meshes.innerCircle = this.addChildElement(NodeView.getInnerCircleGeometry(radius), this.innerCircleMaterial);
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
