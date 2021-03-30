function customerMode() {
  if (typeof vmlBrowserCustomerMode === 'undefined' || vmlBrowserCustomerMode === null) {
    return false;
  } else if (vmlBrowserCustomerMode) {
    return true;
  } else {
    return false;
  }
} // customerMode


function asText(name) {
  var public_text = customerMode() ? "Long description" : "Public text";

  var translator = {
    "addr":                      "Address",
    "base_addr":                 "Base address",
    "ccb":                       "Conversion callback function",
    "chip":                      "Chip",
    "chip_sim_path_gl_prefix":   "Top-most part of HDL path in gatelevel",
    "chip_sim_path_rtl_prefix":  "Top-most part of HDL path in RTL",
    "debug":                     "Debug",
    "default":                   "Default value",
    "docname":                   customerMode() ? "Name" : "Datasheet name",
    "ercb":                      "Examined read callback function",
    "field":                     "Field",
    "field_enc":                 "Encoding",
    "field_private_text":        "Private text",
    "field_public_text":         customerMode() ? "Description" : "Public text", // No "short description" for fields
    "fwcb":                      "Forced write callback function",
    "icb":                       "Instance change callback function",
    "id":                        "Target ID",
    "inst":                      "Instance name",
    "interface_type":            "Interface type",
    "name":                      "Name",
    "offset":                    "Address offset",
    "pos":                       "Lsbit position",
    "rcb":                       "Read callback function",
    "reg":                       "Register",
    "reg_private_text":          "Private text",
    "reg_public_text":           public_text,
    "reg_short_dscr":            "Short description",
    "reggrp":                    "Register Group",
    "reggrp_private_text":       "Private text",
    "reggrp_public_text":        public_text,
    "reggrp_short_dscr":         "Short description",
    "reggrpcoll":                "Register Group Collection",
    "reggrpcoll_private_text":   "Private text",
    "reggrpcoll_public_text":    public_text,
    "reggrpcoll_short_dscr":     "Short description",
    "remove":                    "Remove",
    "repl_cnt":                  "Replication count",
    "repl_prefix":               "Replication prefix",
    "repl_width":                "Replication width",
    "target":                    "Target",
    "target_private_text":       "Private text",
    "target_public_text":        public_text,
    "target_short_dscr":         "Short description",
    "target_sim_path_gl":        "HDL path in gatelevel",
    "target_sim_path_rtl":       "HDL path in RTL",
    "type":                      "Access type",
    "type_cnt_incr_width":       "CNT incr. width",
    "type_cnt_saturates_at":     "CNT saturates at",
    "type_ha":                   "HA only",
    "type_ha_alignment":         "HA alignment",
    "type_ha_bits_per_row":      "HA bits per row",
    "type_ha_mode":              "HA mode",
    "type_ha_user_addr_per_row": "HA user addresses per row",
    "type_he_provide_val":       "HE provide value",
    "wcb":                       "Write callback function",
    "width":                     "Width",
    
    "vml_target_size":           "Target size",
  };
  var postfix = "";
  if (name.substr(-5) == "_orig") {
    name = name.substr(0, name.lastIndexOf("_orig"));
    postfix = " (original value)";
  }
  if (name == "chip_info" || name == "target_info" ||
      name == "save_date" || name == "save_time" || name == "saved_by") {
    return null;
  }
  var result = translator[name];
  if (result == null) {
    return null;
  }
  return result + postfix;
}

function $(e) {
  return document.getElementById(e);
}

function createSavedValue(node) {
  var result = "";
  if (node.hasAttribute('save_date')) {
    result += node.getAttribute('save_date') + " ";
  }
  if (node.hasAttribute('save_time')) {
    result += "@" + node.getAttribute('save_time') + " ";
  }
  if (node.hasAttribute('saved_by')) {
    result += "by " + node.getAttribute('saved_by');
  }
  if (result != "") {
    var tr = document.createElement('tr');
    tr.setAttribute('class', "vml");
    var th = document.createElement('th');
    th.setAttribute('class', "vml");
    th.appendChild(document.createTextNode("Last saved"))
    tr.appendChild(th);
    var td = document.createElement('td');
    td.setAttribute('class', "vml");
    td.appendChild(document.createTextNode(result));
    tr.appendChild(td);
    return tr;
  } else {
    return document.createTextNode("");
  }
}

function rega(e) {
  if (vmlSearchActive) {
    createOutline();
  }
  if (e.target.hasAttribute('data-path')) {
    navigateTo(e.target.getAttribute('data-path').split(","), true);
  }
  e.stopPropagation();
}

function completePath(path) {
  while (path.length > 1 && path[path.length - 1] == "" && path[path.length - 2] == "") {
    path.pop();
  }

  if (path.length == 0) {
    return null;
  }
  
  var levelOffset;
  if (vmlType == "CML") {
    levelOffset = 1;
  } else {
    levelOffset = 0;
  }
  
  var element = vml;
  
  for (var level = 0; level < 4; level++) {
    if (path[level] != "") {
      var elementList = element.getElementsByTagName(vmlLevels[levelOffset + level]);
      var elementFound = false;
      for (var i = 0; i < elementList.length; i++) {
        if (getName(elementList[i]).toLowerCase() == path[level]) {
          element = elementList[i];
          elementFound = true;
          break;
        }
      }
      if (!elementFound) {
        return null;
      }
      var parentElement = element;
      for (var i = level - 1; i >= 0; i--) {
        if (path[i] == "") {
          parentElement = parentElement.parentNode;
          path[i] = getName(parentElement).toLowerCase();
        } else {
          break;
        }
      }
      if (path.length == level + 1 || (path.length == level + 2 && path[level + 1] == "")) {
        return path;
      }
    }
  }
  
  return path.slice(0, 4);
}

function createTextValue(text) {
  var result = document.createElement('p');
  result.setAttribute('class', "vml");
  var textArray = text.split(/\r?\n/);
  for (var i = 0; i < textArray.length; i++) {
    if (i > 0) {
      result.appendChild(document.createElement('br'));
    }
    var line = textArray[i];
    do {
      var firstIndex = line.search(/[A-Z0-9_]+:([A-Z0-9_]+(\[[^\]]*\])?)?(:[A-Z0-9_]+(\[[[^\]]]*\])?(\.[A-Z0-9_]+)?)?/);
      if (firstIndex > -1) {
        var firstMatch = line.match(/([A-Z0-9_]+):(([A-Z0-9_]+)(\[[^\]]*\])?)?(:([A-Z0-9_]+)(\[[^\]]*\])?(\.([A-Z0-9_]+))?)?/);
        var match = firstMatch[0];
        result.appendChild(document.createTextNode(line.slice(0, firstIndex)));
        var path = [firstMatch[1].toLowerCase(), (firstMatch[3] == null ? "" : firstMatch[3].toLowerCase())];
        if (firstMatch[6] != null) {
          path.push(firstMatch[6].toLowerCase());
          if (firstMatch[9] != null) {
            path.push(firstMatch[9].toLowerCase());
          }
        }
        var pathVal = null;
        if (!(path.length == 2 && path[1] == "")) {
          pathVal = completePath(path);
        }
        if (pathVal == null) {
          result.appendChild(document.createTextNode(match));
        } else {
          var a = document.createElement('a');
          a.setAttribute('class', "vml");
          a.setAttribute('onclick', "rega(event)");
          a.setAttribute('data-path', path.join(","));
          a.appendChild(document.createTextNode(match));
          result.appendChild(a);
        }
        line = line.slice(firstIndex + match.length);
      } else {
        result.appendChild(document.createTextNode(line));
      }
    } while (firstIndex > -1);
  }
  return result;
}

function createValue(node, parent) {
  var value;
  if (node.nodeType == 2) {
    if ((node.nodeName == 'base_addr' || node.nodeName == 'id' || node.nodeName == 'offset') && isFinite(node.value)) {
      value = "0x" + parseInt(node.value).toString(16).toUpperCase();
    } else if (node.nodeName == 'addr') {
      var addr = node.value.split(" ")[0];
      if (isFinite(addr)) {
        value = "0x" + parseInt(addr).toString(16).toUpperCase();
      }
    } else if (node.nodeName == 'vml_target_size') {
      value = node.value + " (" + Math.ceil(Math.log2(node.value)) + " bit)";
    } else {
      value = node.value;
    }
    if (parent != null && parent.hasAttribute(node.nodeName + "_orig")) {
      value += " (resolved from '" + parent.getAttribute(node.nodeName + "_orig") + "')";
    }
  } else {
    value = node.textContent;
  }
  return value;
}

function createValueRow(node, parent, className) {
  var nameText = asText(node.nodeName);
  var name;
  var value;
  if (nameText == null) {
    return document.createTextNode("");
  }
  if (node.nodeType == 2) {
    name = document.createTextNode(nameText);
    value = document.createTextNode(createValue(node, parent));
  } else {
    name = document.createElement('p');
    name.setAttribute('class', "vml");
    name.appendChild(document.createTextNode(nameText));
    value = createTextValue(createValue(node, parent));
  }
  var tr = document.createElement('tr');
  tr.setAttribute('class', className);
  var th = document.createElement('th');
  th.setAttribute('class', "vml");
  th.appendChild(name);
  tr.appendChild(th);
  var td = document.createElement('td');
  td.setAttribute('class', "vml");
  td.appendChild(value);
  tr.appendChild(td);
  return tr;
}

function getName(node) {
  return node.getAttribute('vml_name');
}

function getReplications(node) {
  return [node.getAttribute('vml_repl_min'), 
          node.getAttribute('vml_repl_max'), 
          node.getAttribute('vml_repl_str')];
}

function getReplName(node) {
  var name = getName(node);
  var repl = getReplications(node);
  if (repl[1] != repl[0]) {
    name += "[" + repl[2] + "]";
  } else if (repl[0] != 0) {
    name += "[" + repl[0] + "]";
  }
  return name;
}

function getOutlineName(node, level) {
  var name = getName(node, level);
  var repl = getReplications(node, level);
  var outline_name = name;
  if (repl[1] != repl[0]) {
    // outline_name += "[" + repl[0] + "-" + repl[1] + "]";
    outline_name += "[" + repl[2] + "]";
  } else if (repl[0] != 0) {
    outline_name += "[" + repl[0] + "]";
  }
  if (node.hasAttribute('vml_inst_name') && !customerMode()) {
    outline_name += "\u00a0(" + node.getAttribute('vml_inst_name') + ")";
  }
  return outline_name;
}

function getFullName(node, level, show_repl, show_group) {
  if (vmlType == "CML") {
    if (level == 0) {
      return getName(node, level);
    } else {
      level--;
    }
  }
  var parentNames = [];
  if (show_repl) {
    parentNames[level] = getReplName(node);
  } else {
    parentNames[level] = getName(node);
  }
  for (var i = level - 1; i >= 0; i--) {
    node = node.parentNode;
    if (!show_group && i == 1 && level > 1) {
      parentNames[i] = "";
    } else {
      if (show_repl) {
        parentNames[i] = getReplName(node);
      } else {
        parentNames[i] = getName(node);
      }
    }
  }
  var result = "";
  var delims = [":", ":", "."];
  for (var i = 0; i <= level; i++) {
    result += parentNames[i];
    if (i < level) {
      result += delims[i];
    }
  }
  return result;
}

function hideTarget(node) {
  if (node.hasAttribute('vml_hide_target') && node.getAttribute('vml_hide_target') == "true") {
    return true;
  } else {
    return false;
  }
}

function getDocName(node) {
  if (node.hasAttribute('docname')) {
    return node.getAttribute('docname');
  } else {
    return node.getAttribute('name');
  }
}

function parseName(node, level) {
  if (vmlType == "CML" && level == 1) {
    var sim_nodes = node.parentNode.getElementsByTagName('target_sim_info');
    if (sim_nodes.length > 0 && sim_nodes[0].hasAttribute('name')) {
      var name = sim_nodes[0].getAttribute('name').replace(/_\d+$/, "");
    } else {
      var name = getDocName(node, level);
    }
    var repl = getReplications(node, level);
    var inst_name = getDocName(node);
    if (repl[1] != repl[0] || repl[0] != 0) {
      node.setAttribute('vml_name', name);
      node.setAttribute('vml_inst_name', inst_name);
    } else {
      var nodes = node.parentNode.parentNode.getElementsByTagName('target');
      var found = false;
      for (var i = 0; i < nodes.length; i++) {
        if (getDocName(nodes[i]) == inst_name) {
          if (found) {
            node.setAttribute('vml_name', name);
            node.setAttribute('vml_inst_name', inst_name);
            return;
          } else {
            found = true;
          }
        }
      }
      if (inst_name != name) {
        node.setAttribute('vml_name', inst_name);
        node.setAttribute('vml_inst_name', name);
      } else {
        node.setAttribute('vml_name', name);
      }
    }
  } else {
    node.setAttribute('vml_name', getDocName(node));
  }
}

function parseReplications(node, level) {
  if (vmlType == "CML" && level == 1) {
    var sim_nodes = node.parentNode.getElementsByTagName('target_sim_info');
    if (sim_nodes.length > 0 && sim_nodes[0].hasAttribute('name') && sim_nodes[0].getAttribute('name').match(/_\d+$/)) {
      var name = sim_nodes[0].getAttribute('name').replace(/_\d+$/, "");
      var repl_min = -1;
      var repl_max = 0;
      var repl_list = [];
      var tgt_info_nodes = node.parentNode.parentNode.getElementsByTagName('target_info');
      for (var i = 0; i < tgt_info_nodes.length; i++) {
        var tgt_sim_nodes = tgt_info_nodes[i].getElementsByTagName('target_sim_info');
        var tgt_nodes = tgt_info_nodes[i].getElementsByTagName('target');
        if (tgt_sim_nodes.length > 0 && tgt_nodes.length > 0 && node.hasAttribute('name') &&
            tgt_sim_nodes[0].hasAttribute('name') && tgt_sim_nodes[0].getAttribute('name').match(name + "_\\d+$") &&
            tgt_nodes[0].hasAttribute('name') && tgt_nodes[0].getAttribute('name') == node.getAttribute('name')) {
          var tgt_repl = parseInt(tgt_sim_nodes[0].getAttribute('name').match(name + "_(\\d+)$")[1]);
          if (repl_min < 0 || tgt_repl < repl_min) {
            repl_min = tgt_repl;
          }
          if (tgt_repl > repl_max) {
            repl_max = tgt_repl;
          }
          repl_list.push(tgt_repl);
        }
      }
      node.setAttribute('vml_repl_min',  repl_min);
      node.setAttribute('vml_repl_max',  repl_max);
      node.setAttribute('vml_repl_list', repl_list);
    } else {
      node.setAttribute('vml_repl_min', 0);
      node.setAttribute('vml_repl_max', 0);
      node.setAttribute('vml_repl_list', [0]);
    }
  } else if (node.hasAttribute('repl_cnt')) {
    node.setAttribute('vml_repl_min', 0);
    var repl_cnt = parseInt(node.getAttribute('repl_cnt'));
    var repl_list = [];
    if (isFinite(repl_cnt)) {
      node.setAttribute('vml_repl_max', repl_cnt - 1);
      for (var i = 0; i < repl_cnt; i++) {
        repl_list.push(i);
      }
      node.setAttribute('vml_repl_list', repl_list);
    } else {
      node.setAttribute('vml_repl_max',  0);
      node.setAttribute('vml_repl_list', [0]);
    }
  } else {
    node.setAttribute('vml_repl_min',  0);
    node.setAttribute('vml_repl_max',  0);
    node.setAttribute('vml_repl_list', [0]);
  }

  var repl_min  = node.getAttribute('vml_repl_min');
  var repl_max  = node.getAttribute('vml_repl_max');
  var repl_list = (node.getAttribute('vml_repl_list')).split(",");

  if (repl_list.length == repl_max - repl_min + 1) {
    // Consecutive range
    node.setAttribute('vml_repl_str', `${repl_min}-${repl_max}`);
  } else {
    // Non-consecutive range
    var repl_str = "";
    var first_range_idx = parseInt(repl_list[0]);
    var prev_idx        = parseInt(repl_list[0]);
    for (var i = 1; i < repl_list.length; i++) {
      var idx = parseInt(repl_list[i]);
      if (idx != prev_idx+1) {
        if (repl_str != "") {
          repl_str += ",";
        }
        repl_str += `${first_range_idx}-${prev_idx}`;

        prev_idx        = idx;
        first_range_idx = idx;
      } else {
        prev_idx = idx;
      }
      if (i == repl_list.length-1) {
        // Last idx
        if (repl_str != "") {
          repl_str += ",";
        }
        if (first_range_idx == idx) {
          repl_str += idx;
        } else {
          repl_str += first_range_idx + "-" + idx;
        }
      }
    }
    node.setAttribute('vml_repl_str', repl_str);
  }
} // parseReplications

function parseHideTarget(node, level) {
  if (vmlType == "CML" && level == 1) {
    var sim_nodes = node.parentNode.getElementsByTagName('target_sim_info');
    if (sim_nodes.length > 0 && sim_nodes[0].hasAttribute('name') && sim_nodes[0].getAttribute('name').match(/_\d+$/)) {
      var name = sim_nodes[0].getAttribute('name').replace(/_\d+$/, "");
      var repl = parseInt(sim_nodes[0].getAttribute('name').match(name + "_(\\d+)$")[1]);
      var tgt_info_nodes = node.parentNode.parentNode.getElementsByTagName('target_info');
      for (var i = 0; i < tgt_info_nodes.length; i++) {
        var tgt_sim_nodes = tgt_info_nodes[i].getElementsByTagName('target_sim_info');
        var tgt_nodes = tgt_info_nodes[i].getElementsByTagName('target');
        if (tgt_sim_nodes.length > 0 && tgt_nodes.length > 0 && node.hasAttribute('name') &&
            tgt_sim_nodes[0].hasAttribute('name') && tgt_sim_nodes[0].getAttribute('name').match(name + "_\\d+$") &&
            tgt_nodes[0].hasAttribute('name') && tgt_nodes[0].getAttribute('name') == node.getAttribute('name')) {
          var tgt_repl = parseInt(tgt_sim_nodes[0].getAttribute('name').match(name + "_(\\d+)$")[1]);
          if (tgt_repl < repl) {
            node.setAttribute('vml_hide_target', "true");
            return;
          }
        }
      }
    }
  }
}

function parseTargetSize(node, level) {
  if ((vmlType == "CML" && level == 1) || (vmlType != "CML" && level == 0)) {
    var reggrps = node.getElementsByTagName(vmlLevels[level + 1]);
    if (reggrps.length > 0) {
      var last_reggrp = 0;
      var last_reggrp_addr = parseInt(reggrps[0].getAttribute('base_addr'));
      for (var reggrp = 1; reggrp < reggrps.length; reggrp++) {
        var reggrp_addr = parseInt(reggrps[reggrp].getAttribute('base_addr'));
        if (reggrp_addr > last_reggrp_addr) {
          last_reggrp = reggrp;
          last_reggrp_addr = reggrp_addr
        }
      }
      if (reggrps[last_reggrp].hasAttribute('repl_width') && isFinite(reggrps[last_reggrp].getAttribute('repl_width')) &&
          reggrps[last_reggrp].hasAttribute('repl_cnt')   && isFinite(reggrps[last_reggrp].getAttribute('repl_cnt'))) {
        var repl_width = parseInt(reggrps[last_reggrp].getAttribute('repl_width'));
        var repl_cnt   = parseInt(reggrps[last_reggrp].getAttribute('repl_cnt'));
        if (repl_width > 0 && repl_cnt > 1) {
          last_reggrp_addr += repl_width * (repl_cnt - 1);
        }
      }
      var regs = reggrps[last_reggrp].getElementsByTagName(vmlLevels[level + 2]);
      if (regs.length > 0) {
        var last_reg = 0;
        var last_reg_addr = parseInt(regs[0].getAttribute('addr').split(" ").slice(-1)[0]);
        for (var reg = 1; reg < regs.length; reg++) {
          var reg_addr = parseInt(regs[reg].getAttribute('addr').split(" ").slice(-1)[0]);
          if (reg_addr > last_reg_addr) {
            last_reg = reg;
            last_reg_addr = reg_addr;
          }
        }

        if (!customerMode()) {
          node.setAttribute('vml_target_size', last_reggrp_addr + last_reg_addr + 1);
        }
      }
    }
  }
}

function createValueHeader(header) {
  var tr = document.createElement('tr');
  tr.setAttribute('class', "vml");
  var th = document.createElement('th');
  th.setAttribute('class', "vml");
  th.setAttribute('colspan', "2");
  var h3 = document.createElement('h3');
  h3.setAttribute('class', "vml");
  tr.appendChild(th).appendChild(h3).appendChild(document.createTextNode(header));
  return tr;
}

function createValueTable(node, level) {
  while ($('vml_vheader').hasChildNodes()) {
    $('vml_vheader').removeChild($('vml_vheader').lastChild);
  }
  if (customerMode() && vmlLevels[level] == "chip") {
    // Avoid "Chip chip"
    $('vml_vheader').appendChild(document.createTextNode("Values of " + asText(vmlLevels[level])));
  } else {
    $('vml_vheader').appendChild(document.createTextNode("Values of " + asText(vmlLevels[level]) + " " + getFullName(node, level, true, true)));
  }

  var result = document.createElement('table');
  result.appendChild(createValueHeader("Attributes"));
  result.appendChild(createSavedValue(node));
  var anodes = node.attributes;
  for (var a = 0; a < anodes.length; a++) {
    if (anodes[a].nodeName.substr(-5) != "_orig" && anodes[a].value != "") {
      if (customerMode() && 
          anodes[a].nodeName == 'name' &&
          node.hasAttribute('docname')) {
        // Skip 'name', only show 'docname'
      } else {
        result.appendChild(createValueRow(anodes[a], node, "vml vml_a"));
      }
    }
  }

  var cnodes = node.childNodes;
  var enodes = [];
  for (var i = 0; i < cnodes.length; i++) {
    if (cnodes[i].nodeType == 1 && cnodes[i].nodeName != vmlLevels[level + 1] && asText(cnodes[i].nodeName) != null && cnodes[i].textContent != "") {
      enodes.push(cnodes[i]);
    }
  }
  if (enodes.length > 0) {
    result.appendChild(createValueHeader("Elements"));
    for (var i = 0; i < enodes.length - 1; i++) {
      result.appendChild(createValueRow(enodes[i], node, "vml vml_e"));
    }
    result.appendChild(createValueRow(enodes[enodes.length - 1], node, "vml vml_e vml_last"));
  }
  if (vmlType == "CML" && level <= 1) {
    var sim_nodes;
    if (level == 0) {
      sim_nodes = node.getElementsByTagName('chip_sim_info');
    } else {
      sim_nodes = node.parentNode.getElementsByTagName('target_sim_info');
    }
    if (sim_nodes.length > 0) {
      if (!customerMode()) {
        if (level == 0) {
          result.appendChild(createValueHeader("Chip Simulation Info"));
        } else {
          result.appendChild(createValueHeader("Target Simulation Info"));
        }
      }
      var sim_anodes = sim_nodes[0].attributes;
      for (var a = 0; a < sim_anodes.length; a++) {
        result.appendChild(createValueRow(sim_anodes[a], sim_nodes[0], "vml vml_a"));
      }
      var sim_cnodes = sim_nodes[0].childNodes;
      var sim_enodes = [];
      for (var i = 0; i < sim_cnodes.length; i++) {
        if (sim_cnodes[i].nodeType == 1 && asText(sim_cnodes[i].nodeName) != null && sim_cnodes[i].textContent != "") {
          sim_enodes.push(sim_cnodes[i]);
        }
      }
      if (sim_enodes.length > 0) {
        for (var i = 0; i < sim_enodes.length - 1; i++) {
          result.appendChild(createValueRow(sim_enodes[i], sim_nodes[0], "vml vml_e"));
        }
        result.appendChild(createValueRow(sim_enodes[sim_enodes.length - 1], sim_nodes[0], "vml vml_e vml_last"));
      }
      if (level == 0) {
        var inst_nodes = node.getElementsByTagName('chip_inst');
        if (inst_nodes.length > 0) {
          result.appendChild(createValueHeader("Instance Address Offsets"));
          for (var i = 0; i < inst_nodes.length; i++) {
            var name = inst_nodes[i].getAttribute('name');
            var value = 0;
            if (inst_nodes[i].hasAttribute('offset') && isFinite(inst_nodes[i].getAttribute('offset'))) {
              value = parseInt(inst_nodes[i].getAttribute('offset'));
            }
            value = "0x" + parseInt(value).toString(16).toUpperCase();
            var tr = document.createElement('tr');
            tr.setAttribute('class', "vml vml_a");
            var th = document.createElement('th');
            th.setAttribute('class', "vml");
            th.appendChild(document.createTextNode(name));
            tr.appendChild(th);
            var td = document.createElement('td');
            td.setAttribute('class', "vml");
            td.appendChild(document.createTextNode(value));
            tr.appendChild(td);
            result.appendChild(tr);
          }
        }
      }
    }
  }
  if (level < vmlLevels.length - 1) {
    result.appendChild(createValueHeader(asText(vmlLevels[level + 1]) + "s"));
    var fnodes = node.getElementsByTagName(vmlLevels[level + 1]);
    for (var i = 0; i < fnodes.length; i++) {
      if (vmlType == "CML" && level == 0 && hideTarget(fnodes[i])) {
        continue;
      }
      var descriptions = fnodes[i].getElementsByTagName(vmlDescriptions[level]);
      var tr = document.createElement('tr');
      tr.setAttribute('class', "vml vml_f");
      var th = document.createElement('th');
      th.setAttribute('class', "vml");
      if (fnodes[i].hasAttribute('pos') && fnodes[i].hasAttribute('width') &&
          isFinite(fnodes[i].getAttribute('pos')) && isFinite(fnodes[i].getAttribute('width'))) {
        var width = parseInt(fnodes[i].getAttribute('width'));
        var lsbit_pos = parseInt(fnodes[i].getAttribute('pos'));
        if (width > 1) {
          var msbit_pos = lsbit_pos + width - 1;
          th.appendChild(document.createTextNode(getOutlineName(fnodes[i], level + 1) + "\u00a0(" + msbit_pos + ":" + lsbit_pos + ")"));
        } else {
          th.appendChild(document.createTextNode(getOutlineName(fnodes[i], level + 1) + "\u00a0(" + lsbit_pos + ")"));
        }
      } else {
        th.appendChild(document.createTextNode(getOutlineName(fnodes[i], level + 1)));
      }
      tr.appendChild(th);
      var td = document.createElement('td');
      td.setAttribute('class', "vml");
      if (descriptions.length > 0) {
        var description = createTextValue(descriptions[0].textContent);
        while (description.hasChildNodes()) {
          td.appendChild(description.firstChild);
        }
      }
      var subtext = "";
      if (vmlType == "CML" && level == 0) {
        var sim_nodes = fnodes[i].parentNode.getElementsByTagName('target_sim_info');
        if (sim_nodes.length > 0) {
          if (sim_nodes[0].hasAttribute('id')) {
            subtext = asText('id') + ": " + createValue(sim_nodes[0].getAttributeNode('id'), null);
          }
          if (sim_nodes[0].hasAttribute('offset')) {
            if (subtext != "") {
              subtext += ", ";
            }
            subtext += asText('offset') + ": " + createValue(sim_nodes[0].getAttributeNode('offset'), null);
          }
        }
      } else if (fnodes[i].hasAttribute('base_addr')) {
        subtext = asText('base_addr') + ": " + createValue(fnodes[i].getAttributeNode('base_addr'), null);
      } else if (fnodes[i].hasAttribute('addr')) {
        subtext = asText('addr') + ": " + createValue(fnodes[i].getAttributeNode('addr'), null);
      } else if (fnodes[i].hasAttribute('default')) {
        subtext = asText('default') + ": " + createValue(fnodes[i].getAttributeNode('default'), null);
      }
      if (subtext != "") {
        if (td.hasChildNodes()) {
          td.appendChild(document.createElement('br'));
        }
        var span = document.createElement('span');
        span.setAttribute('class', "vml_subtext");
        span.appendChild(document.createTextNode(subtext));
        td.appendChild(span);
      }
      tr.appendChild(td);
      result.appendChild(tr);
    }
  }
  while ($('vml_values').hasChildNodes()) {
    $('vml_values').removeChild($('vml_values').lastChild);
  }
  $('vml_values').appendChild(result);
}

window.onpopstate = function(event) {
  if (vmlFile != null) {
    vmlSelect = [];
    parseUrl();
    if (vmlType == "CML") {
      vmlSelect = vmlSelect.slice(0,4);
    } else {
      vmlSelect = vmlSelect.slice(0,3);
    }
    var path = completePath(vmlSelect);
    if (path != null) {
      vmlSelect = path;
    }
    if (vmlSearchActive) {
      createOutline();
    }
    selLi.className = "vml";
    selLi = $('vml_outline').getElementsByTagName('li')[0].firstChild;
    selLi.className = "vml vml_selected";
    createValueTable(vml.getElementsByTagName(vmlLevels[0])[0], 0);
    if (vmlSelect.length > 0) {
      expandTo(0);
      navigateTo(vmlSelect, false);
    }
  } else if (selLi != null) {
    history.go(0);
  }
}

function selectElement(e, updateHistory) {
  if (e.hasAttribute('data-ids')) {
    var ids = e.getAttribute('data-ids').split(",");
  } else {
    return;
  }
  if (selLi != null) {
    selLi.className = "vml";
  }
  e.className = "vml vml_selected";
  selLi = e;
  
  if (updateHistory) {
    vmlSelect = [];
  }
  var node = vml;
  for (var i = 0; i < ids.length; i++) {
    node = node.getElementsByTagName(vmlLevels[i])[ids[i]];
    if ((vmlType != "CML" || i > 0) && updateHistory) {
      if ((vmlType == "CML" && i == 1) || (vmlType != "CML" && i == 0)) {
        vmlSelect.push(getReplName(node).toLowerCase());
      } else {
        vmlSelect.push(getName(node).toLowerCase());
      }
    }
  }
  if (customerMode() && updateHistory) {
    history.pushState(null, "", vmlBrowserUrl + "?select=" + vmlSelect.join(","));
  } else {
    if (vmlFile != null && updateHistory) {
      history.pushState(null, "", vmlBrowserUrl + "?file=" + vmlFile + "&select=" + vmlSelect.join(","));
    }
  }
  createValueTable(node, ids.length - 1);
}

function lia(e) {
  selectElement(e.target, true);
  e.stopPropagation();
}

function li(e) {
  if (e.target.className == "vml vml_exp") {
    e.target.className = "vml vml_notexp";
  } else if (e.target.className == "vml vml_notexp") {
    e.target.className = "vml vml_exp";
  }
  e.stopPropagation();
}

function navigateTo(path, updateHistory, currentLi) {
  if (path.length > 0) {
    var ul;
    if (currentLi == null) {
      currentLi = $('vml_outline').getElementsByTagName('li')[0];
      if (vmlType == "CML") {
        currentLi.className = "vml vml_exp";
        ul = currentLi.getElementsByTagName('ul');
      } else {
        ul = $('vml_outline').getElementsByTagName('ul');
      }
    } else {
      ul = currentLi.getElementsByTagName('ul');
    }
    if (ul.length > 0) {
      var li = ul[0].childNodes;
      for (var i = 0; i < li.length; i++) {
        if (li[i].firstChild.firstChild.nodeValue.split("\u00a0")[0].toLowerCase() == path[0] ||
            li[i].firstChild.firstChild.nodeValue.split("\u00a0")[0].split("[")[0].toLowerCase() == path[0]) {
          var new_path = path.slice(1);
          if (new_path.length > 0) {
            li[i].className = "vml vml_exp";
          }
          navigateTo(new_path, updateHistory, li[i]);
          return;
        }
      }
      selectElement(currentLi.firstChild, updateHistory);
      $('vml_outline').scrollTop = currentLi.offsetTop;
    }
  } else {
    if (currentLi == null) {
      currentLi = $('vml_outline').getElementsByTagName('li')[0];
    }
    selectElement(currentLi.firstChild, updateHistory);
    $('vml_outline').scrollTop = currentLi.offsetTop;
  }
}

function expandTo(level) {
  var li = $('vml_outline').getElementsByTagName('li');
  for (var i = 0; i < li.length; i++) {
    if (li[i].className == "vml vml_notexp") {
      li[i].className = "vml vml_exp";
    }
  }
  var ul = $('vml_outline').getElementsByClassName("vml_level" + level);
  for (var l = 0; l < ul.length; l++) {
    li = ul[l].getElementsByTagName('li');
    for (var i = 0; i < li.length; i++) {
      if (li[i].className == "vml vml_exp") {
        li[i].className = "vml vml_notexp";
      }
    }
  }
  navigateTo([], false);
  if (vmlSelect.length > 0) {
    navigateTo(vmlSelect, false);
  }
}

function levelClass(level) {
  var maxLevel = 2;
  if (vmlType == "CML" || vmlSelect.length > 0) {
    maxLevel = 1;
  }
  if (level < maxLevel) {
    return "vml_exp";
  } else if (level < vmlLevels.length - 1) {
    return "vml_notexp";
  } else {
    return "vml_leaf";
  }
}

function createOutlineLevel(node, level, ids) {
  var result = document.createElement('ul');
  result.setAttribute('class', "vml vml_level" + level);
  var nodeList = node.getElementsByTagName(vmlLevels[level]);
  for (var i = 0; i < nodeList.length; i++) {
    if (vmlType == "CML" && level == 1 && hideTarget(nodeList[i])) {
      continue;
    }
    var li = document.createElement('li');
    li.setAttribute('class', "vml " + levelClass(level));
    li.setAttribute('onclick', "li(event)");
    
    var a = document.createElement('a');
    a.setAttribute('class', "vml");
    a.setAttribute('onclick', "lia(event)");
    a.setAttribute('data-ids', ids.concat(i).join(","));
    a.appendChild(document.createTextNode(getOutlineName(nodeList[i], level)));
    li.appendChild(a);
    
    if (level < vmlLevels.length - 1) {
      li.appendChild(createOutlineLevel(nodeList[i], level + 1, ids.concat(i)));
    }
    
    result.appendChild(li);
  }
  return result;
}

function createOutline() {
  var expand = document.createElement('p');
  expand.setAttribute('class', "vml");
  expand.appendChild(document.createElement('strong'))
    .appendChild(document.createTextNode("Expand to:"));
  expand.appendChild(document.createTextNode(" "));
  for (var i = 0; i < vmlLevels.length; i++) {
    var a = document.createElement('a');
    a.setAttribute('class', "vml");
    a.setAttribute('onclick', "expandTo(" + i + ")");
    a.appendChild(document.createTextNode(asText(vmlLevels[i])));
    expand.appendChild(a);
    if (i < vmlLevels.length - 1) {
    expand.appendChild(document.createTextNode(", "));
    }
  }
  while ($('vml_expand').hasChildNodes()) {
    $('vml_expand').removeChild($('vml_expand').lastChild);
  }
  $('vml_expand').appendChild(expand);
  while ($('vml_outline').hasChildNodes()) {
    $('vml_outline').removeChild($('vml_outline').lastChild);
  }
  $('vml_expand').appendChild(expand);
  $('vml_outline').appendChild(createOutlineLevel(vml, 0, []));
  navigateTo([], false);
  var path = completePath(vmlSelect);
  if (path != null) {
    vmlSelect = path;
  }
  if (vmlSelect.length > 0) {
    navigateTo(vmlSelect, false);
  }
  vmlSearchActive = false;
}

function checkErrorXML(n, error) {
  var l, name;
  name = n.nodeName;
  if (error == null) {
    error = "";
  }
  if (name == "h3") {
    return "";
  }
  if (name == "#text") {
    error = "<p>" + error + n.nodeValue + "</p>";
  }
  l = n.childNodes.length;
  for (var i = 0; i < l; i++) {
    error = error + checkErrorXML(n.childNodes[i], error);
  }
  return error;
}

function loadXMLDoc(fileurl) {
  var xmlDoc = null;
  try {
    if (!customerMode()) {
      xhttp = new XMLHttpRequest();
      xhttp.open("GET", fileurl, false);
      xhttp.send();
      xmlDoc = xhttp.responseXML;
    } else {
      // Parse embedded XML
      xmlDoc = new window.DOMParser().parseFromString(vmlStr, "text/xml");
    }
  } catch (e) {
    xmlDoc = null;
  }
  
  if (xmlDoc == null) {
    $('vml_errors').innerHTML = "<p><strong>The file '" + fileurl + "' could not be loaded.</strong></p>"
    return null;
  } else if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    $('vml_errors').innerHTML = "<p><strong>The file has the following errors:</strong></p>" + checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
    return null;
  }
  return xmlDoc;
}


function vmlSearchMatchFull(node, text) {
  var searchElements = ["field_enc",
                        "field_private_text",
                        "field_public_text",
                        "reg_private_text",
                        "reg_public_text",
                        "reg_short_dscr",
                        "reggrp_private_text",
                        "reggrp_public_text",
                        "reggrp_short_dscr",
                        "reggrpcoll_private_text",
                        "reggrpcoll_public_text",
                        "reggrpcoll_short_dscr",
                        "target_private_text",
                        "target_public_text",
                        "target_short_dscr"];
  var childs = node.childNodes;
  var n = childs.length;
  for (var i = 0; i < n; i++) {
    var cnode = childs[i];
    if (cnode.nodeType == 1 &&
        searchElements.indexOf(cnode.nodeName) != -1 &&
        cnode.textContent.toUpperCase().search(text) > -1) {
      return true;
    }
  }
  return false;
}

function vmlSearchMatch(node, level, text, text_clean, fullname) {
  var name1 = getFullName(node, level, false, true).toUpperCase();
  var name2 = getFullName(node, level, false, false).toUpperCase();
  if (name1 === text_clean || name2 === text_clean ||
      getName(node).toUpperCase().search(text) > -1 ||
      (fullname && (name1.search(text) > -1 || name2.search(text) > -1))) {
    return true;
  } else {
    return false;
  }
}

function vmlSearchLevel(ul, text, text_clean, fulltext, fullname, node, level, ids) {
  var matches = 0;
  var nodeList = node.getElementsByTagName(vmlLevels[level]);
  for (var i = 0; i < nodeList.length; i++) {
    if (vmlType == "CML" && level == 1 && hideTarget(nodeList[i])) {
      continue;
    }
    if (vmlSearchMatch(nodeList[i], level, text, text_clean, fullname) ||
        (fulltext && vmlSearchMatchFull(nodeList[i], text))) {
      var li = document.createElement('li');
      li.setAttribute('class', "vml_search_result");
      var a = document.createElement('a');
      a.setAttribute('class', "vml");
      a.setAttribute('onclick', "lia(event)");
      a.setAttribute('data-ids', ids.concat(i).join(","));
      a.appendChild(document.createTextNode(getFullName(nodeList[i], level, true, true)));
      li.appendChild(a);
      ul.appendChild(li);
      matches++;
    }
    if (level < vmlLevels.length - 1) {
      matches += vmlSearchLevel(ul, text, text_clean, fulltext, fullname, nodeList[i], level + 1, ids.concat(i))
    }
  }
  return matches;
}

function initVML(select) {
  if (vml != null) {
    vmlType = null;
    switch(vml.documentElement.nodeName) {
      case "reggrpcoll":
        vmlType = "RML";
        vmlLevels = ["reggrpcoll", "reggrp", "reg", "field"];
        vmlDescriptions = ["reggrp_short_dscr", "reg_short_dscr", "field_public_text"];
        break;
      case "target":
        vmlType = "TML";
        vmlLevels = ["target", "reggrp", "reg", "field"];
        vmlDescriptions = ["reggrp_short_dscr", "reg_short_dscr", "field_public_text"];
        break;
      case "chip":
        vmlType = "CML";
        vmlLevels = ["chip", "target", "reggrp", "reg", "field"];
        vmlDescriptions = ["target_short_dscr", "reggrp_short_dscr", "reg_short_dscr", "field_public_text"];
        break;
      default:
        $('vml_errors').innerHTML = "<p><strong>The file is not a valid VML file.</strong></p>";
    }
    if (vmlType != null) {
      if (vmlType == "CML") {
        vmlSelect = select.slice(0,4);
      } else {
        vmlSelect = select.slice(0,3);
      }
      for (var level = 0; level < vmlLevels.length; level++) {
        var nodes = vml.getElementsByTagName(vmlLevels[level]);
        for (var node = 0; node < nodes.length; node++) {
          parseTargetSize(nodes[node], level);
          parseHideTarget(nodes[node], level);
          parseReplications(nodes[node], level);
          parseName(nodes[node], level);
        }
      }
      createOutline();
    } else {
      vml = null;
    }
  }
}

function parseUrl() {
  var parts = document.location.href.split("?");

  if (customerMode()) {
    // No file in URL, but "?select=<target>[,<grp>[,<reg>[,<fld>]]]" may be present.
    if (parts.length == 2) {
      var args = parts[1].split("&");
       if (args.length == 1) {
         if (args[0].substr(0, 7) == "select=") {
           vmlSelect = args[0].substr(7).toLowerCase().split(",");
         }
       }
    }
    return;
  }  

  if (parts.length == 2) {
    var args = parts[1].split("&");
    if (args.length == 1 || args.length == 2) {
      if (args.length == 2) {
        if (args[1].substr(0, 7) == "select=") {
          vmlSelect = args[1].substr(7).toLowerCase().split(",");
        } else {
          return false;
        }
      }
      if (args[0].substr(0, 5) == "file=") {
        vmlFile = args[0].substr(5);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function vmlSearch(text, full) {
  text = text.trim().toUpperCase();
  if (text === "") {
    if (vmlSearchActive) {
      createOutline();
    }
  } else {
    selLi = null;
    var expand = document.createElement('p');
    expand.setAttribute('class', "vml");
    var a = document.createElement('a');
    a.setAttribute('class', "vml");
    a.setAttribute('onclick', "createOutline()");
    a.appendChild(document.createTextNode("Clear search results"));
    expand.appendChild(a);
    while ($('vml_expand').hasChildNodes()) {
      $('vml_expand').removeChild($('vml_expand').lastChild);
    }
    $('vml_expand').appendChild(expand);
    while ($('vml_outline').hasChildNodes()) {
      $('vml_outline').removeChild($('vml_outline').lastChild);
    }
    var ul = document.createElement('ul');
    ul.setAttribute('class', "vml");
    var fullname = false;
    if ((vmlType == "CML" && text.search(/^[^:]*(:[^:]*){2}$/) > -1) ||
        (vmlType != "CML" && text.search(/^[^:]*(:[^:]*){1}$/) > -1)) {
      fullname = true;
    }
    var text_clean = text.replace(/\[\d+(-\d+)?\]/g, "");
    if (vmlSearchLevel(ul, text, text_clean, full, fullname, vml, 0, [])) {
      $('vml_outline').appendChild(ul);
      $('vml_outline').getElementsByTagName('a')[0].click();
    } else {
      var em = document.createElement('em');
      em.setAttribute('class', "vml");
      em.appendChild(document.createTextNode("(No matches found)"));
      $('vml_outline').appendChild(em);
    }
    
    vmlSearchActive = true;
  }
}

function vmlFocusOnSelected() {
  $('vml_outline').scrollTop = selLi.offsetTop;
}

function getVML() {
  return vml;
}

function getVMLType() {
  return vmlType;
}

function getVMLFilename() {
  return vmlFile;
}

function loadVMLFile(file, select) {
  vml = null;
  vmlBrowserUrl = document.location.href.split("?")[0];
  vmlFile = file;
  vmlSelect = [];
  vml = loadXMLDoc(file);
  initVML(select);
  if (vml == null) {
    return false;
  } else {
    return true;
  }
}

function checkVMLFilenameInput() {
  if (customerMode()) {
    parseUrl();
    loadVMLFile(null, vmlSelect);
    if (vml != null) {
      return true;
    }
  } else {
    vmlFile = null;
    if (document.location.href.indexOf("?") != -1) {
      if (parseUrl()) {
        if (vmlFile != null) {
          loadVMLFile(vmlFile, vmlSelect);
          if (vml != null) {
            return true;
          }
        }
      } else {
        $('vml_errors').innerHTML = "<p><strong>Malformed URL.</strong></p>";
        vmlFile = null;
        vmlSelect = [];
      }
    }
  }
  return false;
}

function loadVMLString(txt, select) {
  vml = null;
  vmlFile = null;
  vmlSelect = [];
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(txt, "text/xml");
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    $('vml_errors').innerHTML = "<p><strong>The file has the following errors:</strong></p>" + checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
    return false;
  }
  vml = xmlDoc;
  initVML(select);
  if (vml == null) {
    return false;
  } else {
    return true;
  }
}

var vmlBrowserUrl;
var vmlFile;
var vmlSelect = [];

var vml;
var vmlType;
var vmlLevels;
var vmlDescriptions;
var vmlSearchActive = false;

var selLi;
