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
import chroma from 'chroma-js';

import * as THREE from 'three';
import BaseView from './baseView';
import GlobalStyles from '../globalStyles';
import Constants from './constants';

const curveSegments = 32;


function getOrSet (obj, key, func) {
  let result = obj[key];
  if (result === undefined) {
    result = func();
    obj[key] = result;
  }
  return result;
}

const outerBorderGeometries = {};
const innerCircleGeometries = {};
const innerBorderGeometries = {};
const donutGeometries = {};
const noticeDotGeometries = {};

class NodeView extends BaseView {
  constructor (node) {
    super(node);
    this.loaded = node.loaded;

    this.donutInternalColor = GlobalStyles.rgba.colorDonutInternalColor;
    this.donutInternalColorThree = new THREE.Color(this.donutInternalColor.r, this.donutInternalColor.g, this.donutInternalColor.b);

    this.borderColor = GlobalStyles.getColorTrafficRGBA(node.getClass());
    this.borderMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.borderColor.r, this.borderColor.g, this.borderColor.b), transparent: true, opacity: this.borderColor.a });
    this.innerCircleMaterial = new THREE.MeshBasicMaterial({ color: this.donutInternalColorThree, transparent: true });
  }

  setOpacity (opacity) {
    super.setOpacity(opacity);
    this.borderMaterial.opacity = opacity * this.borderColor.a;
    // Fade the inner node color to background color since setting opacity will show the particles hiding behind the node.
    if (!this.highlight) {
      this.innerCircleMaterial.color.setStyle(chroma.mix(GlobalStyles.styles.colorPageBackground, GlobalStyles.styles.colorDonutInternalColor, opacity).css());
      this.meshes.innerCircle.geometry.colorsNeedUpdate = true;
    }

    if (this.nameView) {
      this.nameView.setOpacity(opacity);
    }
  }

  getOpacity () {
    return this.borderMaterial.opacity;
  }

  getDepth () {
    return this.depth;
  }

  setHighlight (highlight) {
    if (this.highlight !== highlight) {
      this.highlight = highlight;
      if (this.nameView) {
        this.nameView.setHighlight(highlight);
      }
      this.refresh(true);
      this.updatePosition();
    }
  }

  // separate refresh just for focused since it's a good subset of refresh
  refreshFocused () {
    if (this.nameView) {
      this.nameView.refresh();
    }
  }

  refresh (force) {
    // Refresh class
    if (this.object.classInvalidated || force) {
      this.object.classInvalidated = false;
      const nodeClass = this.object.getClass();
      const borderColor = GlobalStyles.getColorTrafficRGBA(nodeClass, this.highlight);
      if (this.highlight) {
        this.innerCircleMaterial.color.setRGB(borderColor.r, borderColor.g, borderColor.b);
        this.meshes.innerCircle.geometry.colorsNeedUpdate = true;
        this.borderMaterial.color.setRGB(borderColor.r, borderColor.g, borderColor.b);
        this.meshes.outerBorder.geometry.colorsNeedUpdate = true;
        if (this.meshes.innerBorder) { this.meshes.innerBorder.geometry.colorsNeedUpdate = true; }
      } else {
        if (this.getOpacity() === 1) {
          this.innerCircleMaterial.color.set(this.donutInternalColorThree);
          this.meshes.innerCircle.geometry.colorsNeedUpdate = true;
        }
        this.borderMaterial.color.setRGB(borderColor.r, borderColor.g, borderColor.b);
        this.meshes.outerBorder.geometry.colorsNeedUpdate = true;
        if (this.meshes.innerBorder) { this.meshes.innerBorder.geometry.colorsNeedUpdate = true; }
      }

      if (this.nameView) {
        this.nameView.refresh();
      }
    }
  }

  update () {
    // No default update function for the view...
  }

  updatePosition () {
    if (this.object.position) {
      const x = this.object.position.x;
      const y = this.object.position.y;
      this.depth = this.dimmed ? Constants.DEPTH.dimmedNode : Constants.DEPTH.normalNode;

      if (this.object.getClass() !== 'normal') {
        this.depth += 5;
      }

      this.container.position.set(x, y, this.depth);
    }
    this.updateLabelPosition();
  }

  updateLabelPosition () {
    if (this.nameView) {
      this._showLabel(this.labelDefaultVisible || this.forceLabel || this.object.forceLabel);
      this.nameView.updatePosition();
    }
  }

  updateText () {
    // No text update function for the default view
  }

  resetDefaultLabelPosition () {
    if (this.object.position) {
      this.labelPositionLeft = this.object.position.x < 1;
    } else {
      this.labelPositionLeft = true;
    }
  }

  setDimmed (dimmed, dimmingApplied) {
    // Show/hide nodeLabel if necessary
    if (this.object.isVisible() && !this.labelDefaultVisible) {
      this.forceLabel = !dimmed && dimmingApplied;
    }
    return super.setDimmed(dimmed, dimmingApplied);
  }

  applyLabelPosition () {
    if (this.nameView) {
      this.nameView.applyPosition();
    }
  }

  showLabel (show) {
    if (this.nameView && this.labelDefaultVisible !== show) {
      this.labelDefaultVisible = show;
      this._showLabel(show);
    }
  }

  _showLabel (show) {
    if (this.nameView) {
      if (show) {
        this.labelVisible = true;
        this.addInteractiveChildren(this.nameView.getInteractiveChildren());
        this.container.add(this.nameView.container);
      } else {
        this.labelVisible = false;
        this.removeInteractiveChildren(this.nameView.getInteractiveChildren());
        this.container.remove(this.nameView.container);
      }
    }
  }

  getLabelScreenDimensions () {
    if (!this.nameView) { return undefined; }
    return this.nameView.screenDimensions;
  }

  setLabelScreenDimensions (dimensions) {
    if (this.nameView) {
      this.nameView.screenDimensions = dimensions;
    }
  }

  cleanup () {
    if (this.nameView) { this.nameView.cleanup(); }
    this.borderMaterial.dispose();
    this.innerCircleMaterial.dispose();
  }

  static getOuterBorderGeometry (radius) {
    return getOrSet(outerBorderGeometries, radius, () => {
      const border = new THREE.Shape();
      border.absarc(0, 0, radius + 2, 0, Math.PI * 2, false);
      const borderHole = new THREE.Path();
      borderHole.absarc(0, 0, radius, 0, Math.PI * 2, true);
      border.holes.push(borderHole);
      return new THREE.ShapeGeometry(border, curveSegments);
    });
  }

  static getInnerCircleGeometry (radius) {
    return getOrSet(innerCircleGeometries, radius, () => {
      const circleShape = new THREE.Shape();
      circleShape.moveTo(radius, 0);
      circleShape.absarc(0, 0, radius, 0, 2 * Math.PI, false);
      return new THREE.ShapeGeometry(circleShape, curveSegments);
    });
  }

  static getInnerBorderGeometry (radius) {
    return getOrSet(innerBorderGeometries, radius, () => {
      const innerBorder = new THREE.Shape();
      innerBorder.absarc(0, 0, radius, 0, Math.PI * 2, false);
      const innerBorderHole = new THREE.Path();
      innerBorderHole.absarc(0, 0, radius - 2, 0, Math.PI * 2, true);
      innerBorder.holes.push(innerBorderHole);
      return new THREE.ShapeGeometry(innerBorder, curveSegments);
    });
  }

  static getDonutGeometry (radius, innerRadius) {
    return getOrSet(donutGeometries, `${radius}:${innerRadius}`, () => {
      const arcShape = new THREE.Shape();
      arcShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      arcShape.holes.push(holePath);
      return new THREE.ShapeGeometry(arcShape, curveSegments);
    });
  }

  static getNoticeDotGeometry (radius) {
    return getOrSet(noticeDotGeometries, radius, () => {
      const noticeShape = new THREE.Shape();
      const dotRadius = radius * 0.5;
      noticeShape.moveTo(dotRadius, 0);
      noticeShape.absarc(0, 0, dotRadius, 0, 2 * Math.PI, false);
      return new THREE.ShapeGeometry(noticeShape, curveSegments);
    });
  }

  static getPipeGeometry (radius) {
    return getOrSet(outerBorderGeometries, radius, () => {
       const ctx = new THREE.Shape();
       var x = -25;
       var y = -10;
       var width = 50;
       var height = 20;
       var r = 10;

       ctx.moveTo( x, y + r );
       ctx.lineTo( x, y + height - r );
       ctx.quadraticCurveTo( x, y + height, x + r, y + height );
       ctx.lineTo( x + width - r, y + height );
       ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - r );
       ctx.lineTo( x + width, y + r );
       ctx.quadraticCurveTo( x + width, y, x + width - r, y );
       ctx.lineTo( x + r, y );
       ctx.quadraticCurveTo( x, y, x, y + r );

       return new THREE.ShapeGeometry(ctx);
     });
  }

  static getStorageGeometry (radius) {
    return getOrSet(innerCircleGeometries, radius, () => {
        var shape = new THREE.Shape();
        var dx = -30;
        var dy = -30;

        shape.moveTo(dx + 4, dy + 0);
        shape.lineTo(dx + 56, dy + 0);
        shape.lineTo(dx + 60, dy + 8);
        shape.lineTo(dx + 60, dy + 12);
        shape.lineTo(dx + 56, dy + 18);
        shape.lineTo(dx + 56, dy + 22);
        shape.lineTo(dx + 60, dy + 28);
        shape.lineTo(dx + 60, dy + 32);
        shape.lineTo(dx + 56, dy + 38);
        shape.lineTo(dx + 56, dy + 42);
        shape.lineTo(dx + 60, dy + 48);
        shape.lineTo(dx + 60, dy + 52);
        shape.lineTo(dx + 56, dy + 60);
        shape.lineTo(dx + 4, dy + 60);
        shape.lineTo(dx + 0, dy + 52);
        shape.lineTo(dx + 0, dy + 48);
        shape.lineTo(dx + 4, dy + 42);
        shape.lineTo(dx + 4, dy + 38);
        shape.lineTo(dx + 0, dy + 32);
        shape.lineTo(dx + 0, dy + 28);
        shape.lineTo(dx + 4, dy + 22);
        shape.lineTo(dx + 4, dy + 18);
        shape.lineTo(dx + 0, dy + 12);
        shape.lineTo(dx + 0, dy + 8);
        shape.lineTo(dx + 4, dy + 0);
      
        return new THREE.ShapeGeometry(shape);
    });
  }
}


export default NodeView;
