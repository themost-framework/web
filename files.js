// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var FileNotFoundError = require('@themost/common').FileNotFoundError;
var Base26Number = require('@themost/common').Base26Number;
var RandomUtils = require('@themost/common').RandomUtils;
var TraceUtils = require('@themost/common').TraceUtils;
var LangUtils = require('@themost/common').LangUtils;
var url = require('url');
var DefaultAttachmentModel = 'Attachment';
/**
 * @abstract
 * @classdesc An abstract class that describes a file storage.
 * @class
 * @constructor
 * @property {string} root - Gets or sets a string that represents the physical root path of this file storage
 * @property {string} virtualPath - Gets or sets a string that represents the virtual path of this file storage
 */
function FileStorage() {
    //
}

/**
 * @param {HttpContext} context
 * @param {string} src
 * @param {*} attrs
 * @param {Function} callback
 */
FileStorage.prototype.copyFrom = function(context, src, attrs, callback) {
    callback  = callback || function() {};
    callback();
};


/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {string} dest
 * @param {Function} callback
 */
FileStorage.prototype.copyTo = function(context, item, dest, callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {Function} callback
 */
FileStorage.prototype.resolvePhysicalPath = function(context, item, callback) {
    callback  = callback || function() {};
    callback();
};
/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {Function} callback
 */
FileStorage.prototype.resolveUrl = function(context, item, callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {Function} callback
 */
FileStorage.prototype.createReadStream = function(context, item, callback) {
    callback  = callback || function() {};
    callback();
};


/**
 * @param {Function} callback
 */
FileStorage.prototype.init = function(callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @param {HttpContext} context
 * @param {*} query
 * @param {Function} callback
 */
FileStorage.prototype.find = function(context, query, callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @param {HttpContext} context
 * @param {*} query
 * @param {Function} callback
 */
FileStorage.prototype.findOne = function(context, query, callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {function(Error=,*=)} callback
 */
FileStorage.prototype.remove = function(context, item, callback) {
    callback  = callback || function() {};
    callback();
};

/**
 * @classdesc AttachmentFileSystemStorage class describes a file storage for attachments' management on local file system.
 * @class
 * @constructor
 * @augments FileStorage
 * @param {string} physicalPath The root directory of this storage
 */
function AttachmentFileSystemStorage(physicalPath) {
    this.root = physicalPath;
    this.virtualPath = null;
    this.ensure = function(callback) {
        var self = this;
        callback = callback || function() {};
        if (self._initialized) {
            callback();
            return;
        }
        if (_.isNil(self.root)) {
            callback(new Error('The file system storage root directory cannot be empty at this context.'));
        }
        else {
            //check directory existence
            fs.exists(self.root, function(exists) {
                if (exists) {
                    self._initialized = true;
                    callback();
                }
                else {
                    fs.mkdir(self.root,function(err) {
                        if (err) {
                            TraceUtils.error(err);
                            callback(new Error('An error occured while trying to initialize file system storage.'));
                        }
                        else {
                            self._initialized = true;
                            callback();
                        }
                    });
                }
            });
        }
    };
}

LangUtils.inherits(AttachmentFileSystemStorage, FileStorage);
/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {function} callback
 */
AttachmentFileSystemStorage.prototype.save = function(context, item, callback) {
    var self = this;
    self.ensure(function(err) {
        if (err) {
            callback(err);
        }
        else {
            if (_.isNil(item)) {
                callback();
                return;
            }
            var type = DefaultAttachmentModel; 
            if (Object.prototype.hasOwnProperty.call(item, 'additionalType')) {
                if (item.additionalType != null) {
                    type = item.additionalType;
                }
            }
            var attachments = context.model(type);
            if (_.isNil(attachments)) {
                callback(new Error('Attachment model cannot be found.'));
            }
            //file default version
            item.version = item.version || 1;
            //file status (false) not published
            item.published = item.published || false;
            if (typeof item.alternateName === 'undefined' || item.alternateName === null) {
                item.alternateName = RandomUtils.randomChars(12);
            }
            //set url
            var virtualPath = self.virtualPath;
            virtualPath += /\/$/.test(virtualPath) ? '' : '/';
            item.url = url.resolve(virtualPath, item.alternateName);
            //save attachment
            attachments.save(item, function(err) {
                callback(err);
            });
        }
    });

};
/**
 * @param {HttpContext} context
 * @param {*} query
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.findOne = function(context, query, callback) {
    var self = this;
    self.ensure(function(err) {
        if (err) {
            callback(err);
        }
        else {
            if (_.isNil(query)) {
                callback();
                return;
            }
            var type = DefaultAttachmentModel; 
            if (Object.prototype.hasOwnProperty.call(query, 'additionalType')) {
                if (query.additionalType != null) {
                    type = query.additionalType;
                }
            }
            var attachments = context.model(type);
            if (_.isNil(attachments)) {
                callback(new Error('Target model cannot be found.'));
            }
            attachments.find(query).first(callback);
        }
    });

};
/**
 *
 * @param {HttpContext} context
 * @param {*} item
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.resolvePhysicalPath = function(context, item, callback) {
    var id = item.id, self = this, file_id;
    if (id) {
        file_id = Base26Number.toBase26(id);
        callback(null, path.join(self.root, file_id.substr(0,1), file_id));
    }
    else {
        self.findOne(context, item, function(err, result) {
            if (err) {
                callback(err);
            }
            else {
                if (_.isNil(result)) {
                    callback(new Error('Item cannot be found'));
                }
                else {
                    file_id = Base26Number.toBase26(result.id);
                    callback(null, path.join(self.root, file_id.substr(0,1), file_id));
                }
            }
        });
    }
};
/**
 *
 * @param {HttpContext} context
 * @param {*} item
 * @param {function(Error=,string=)} callback
 */
AttachmentFileSystemStorage.prototype.resolveUrl = function(context, item, callback) {
    var alternateName = item.alternateName, self = this;
    // get virtual path
    var virtualPath = self.virtualPath;
    virtualPath += /\/$/.test(virtualPath) ? '' : '/';
    if (alternateName) {
        callback(null, url.resolve(virtualPath, alternateName));
    }
    else {
        self.findOne(context, item, function(err, result) {
            if (err) {
                callback(err);
            }
            else {
                if (_.isNil(result)) {
                    callback(new Error('Item cannot be found'));
                }
                else {
                    callback(null, url.resolve(virtualPath, result.alternateName));
                }
            }
        });
    }
};

/**
 * @param {HttpContext} context
 * @param {*} item
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.createReadStream = function(context, item, callback) {
    var self = this, filePath;
    self.findOne(context, item, function(err, result) {
        if (err) {
            callback(err);
        }
        else {
            if (_.isNil(result)) {
                callback(new Error('Item cannot be found'));
            }
            else {
                //get file id
                var file_id = Base26Number.toBase26(result.id);
                //create file path
                filePath = path.join(self.root, file_id.substr(0,1), file_id);
                //check file
                fs.exists(filePath, function(exists) {
                    if (!exists) {
                        callback(new FileNotFoundError());
                    }
                    else {
                        callback(null, fs.createReadStream(filePath));
                    }
                });
            }
        }
    });

};

/**
 * @param {HttpContext} context
 * @param {*} query
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.exists = function(context, query, callback) {
    callback  = callback || function() {};
    this.findOne(context, query, function(err, result) {
        if (err) {
            TraceUtils.error(err);
            callback(false);
        }
        else {
            callback(!_.isNil(result));
        }
    });
};
/**
 * @param {HttpContext} context
 * @param {*} query
 * @param {function(Error=,*=)} callback
 */
AttachmentFileSystemStorage.prototype.find = function(context, query, callback) {
    var self = this;
    self.ensure(function(err) {
        if (err) {
            callback(err);
        }
        else {
            if (_.isNil(query)) {
                callback();
            }
            else {
                var type = DefaultAttachmentModel; 
                if (Object.prototype.hasOwnProperty.call(query, 'additionalType')) {
                    if (query.additionalType != null) {
                        type = query.additionalType;
                    }
                }
                var attachments = context.model(type);
                if (_.isNil(attachments)) {
                    callback(new Error('Target model cannot be found.'));
                }
                attachments.find(query).all(callback)
            }
        }
    });
};


/**
 * @param {function(Error=)} callback
 */
AttachmentFileSystemStorage.prototype.init = function(callback) {
    this.ensure(callback);
};

/**
 * @param {HttpContext} context
 * @param {string} src
 * @param {*} attrs
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.copyFrom = function(context, src, attrs, callback) {
    var self = this;
    callback = callback || function() {};
    self.ensure(function(err) {
        if (err) {
            callback(err);
        }
        else {
            var filename = path.basename(src);
            attrs = attrs || {};
            //set file composition name
            attrs.name = attrs.name || filename;
            //check source file
            fs.exists(src, function(exists) {
                if (!exists) {
                    callback(new Error('The source file cannot be found'));
                }
                else {
                    //save attributes
                    //insert item attributes
                    self.save(context, attrs, function(err) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            //file operation (save to folder)
                            var file = Base26Number.toBase26(attrs.id);
                            fs.exists(path.join(self.root, file.substr(0,1)), function(exists) {
                                if (exists) {
                                    copyFile(src,path.join(self.root, file.substr(0,1), file), function(err) {
                                        callback(err);
                                    });
                                }
                                else {
                                    fs.mkdir(path.join(self.root, file.substr(0,1)), function(err) {
                                        if (err) {
                                            callback(err);
                                        }
                                        else {
                                            copyFile(src,path.join(self.root, file.substr(0,1), file), function(err) {
                                                callback(err);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

        }
    });
};


/**
 * @param {HttpContext} context
 * @param {string|*} item
 * @param {string} dest
 * @param {Function} callback
 */
AttachmentFileSystemStorage.prototype.copyTo = function(context, item, dest, callback) {
    var self = this;
    callback  = callback || function() {};
    self.ensure(function(err) {
        if (err) {
            callback(err);
        }
        else {
            if (_.isNil(item)) {
                callback(new Error('The source item cannot be empty at this context'));
                self.findOne(context, item, function(err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (_.isNil(result)) {
                            callback(new Error('The source item cannot be found.'));
                        }
                        else {
                            var file = Base26Number.toBase26(result.id), src = path.join(self.root, file.substr(0,1), file);
                            fs.exists(src, function(exists) {
                                if (!exists) {
                                    callback(new Error('The source file cannot be found.'));
                                }
                                else {
                                    var destFile = path.join(dest, result.name);
                                    copyFile(src, destFile, function(err) {
                                        callback(err, destFile);
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });

};

/**
 * @param {string} src
 * @param {string} dest
 * @param {Function} callback
 * @private
 */
function copyFile(src, dest, callback) {
    //create read stream
    var source = fs.createReadStream(src);
    //create write stream
    var finalDest = fs.createWriteStream(dest);
    //copy file
    source.pipe(finalDest);
    source.on('end', function() {
            callback();
    });
    source.on('error', function(err) {
        callback(err);
    });
}

if (typeof exports !== 'undefined') {
    module.exports.FileStorage = FileStorage;
    module.exports.AttachmentFileSystemStorage = AttachmentFileSystemStorage;
}
