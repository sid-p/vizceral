/**
 *
 *  Copyright 2016 Netflix, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
import * as THREE from 'three';

import NodeView from './nodeView';
import NodeViewStandard from './nodeViewStandard';
import NodeNameView from './nodeNameView';
import GlobalStyles from '../globalStyles';

const radius = 32;

class NodeViewPipe extends NodeViewStandard {
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

    // this.meshes.outerBorder = this.addChildElement(new THREE.BoxGeometry(6 * radius, 2 * radius, 0), this.borderMaterial);
    // this.meshes.innerCircle = this.addChildElement(new THREE.BoxGeometry(5.4 * radius, 1.8 * radius, 0), this.innerCircleMaterial);

    /**/
    this.meshes.outerBorder = this.addChildElement(new THREE.BoxGeometry(1, 1, 0), this.borderMaterial);

    const ctx = new THREE.Shape();
    const x = -60;
    const y = -20;
    const width = 120;
    const height = 40;
    const r = 10;

    ctx.moveTo(x, y + r);
    ctx.lineTo(x, y + height - r);
    ctx.quadraticCurveTo(x, y + height, x + r, y + height);
    ctx.lineTo(x + width - r, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - r);
    ctx.lineTo(x + width, y + r);
    ctx.quadraticCurveTo(x + width, y, x + width - r, y);
    ctx.lineTo(x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);

    this.meshes.innerCircle = this.addChildElement(new THREE.ShapeGeometry(ctx, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('rgb(66, 165, 69)'), transparent: true, opacity: this.dotColor.a }));

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

export default NodeViewPipe;
