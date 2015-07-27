module.exports = function(grunt)
{
	var pkg = grunt.file.readJSON("package.json"),
		fs = require("fs"),
		buildPath = "build/hopjs-"+pkg.version,
		minFiles = [
			"hop",
			"base",
			"widgets/datepicker",
			"widgets/datepickeranimations",
			"widgets/dropdownmenu",
			"widgets/layer",
			"widgets/menu",
			"widgets/menubutton",
			"widgets/tabs",
			"widgets/tooltip",
			"widgets/window"
		],
		locales = fs.readdirSync("js/i18n"),
		minFilesMap = [], i;

	for (i in minFiles)
	{
		minFilesMap.push({
			src: buildPath+'/js/'+minFiles[i]+'.js',
			dest: buildPath+'/js/min/'+minFiles[i]+'.min.js',
		});
	}

	i18nConcatFilesMap = [];
	for (i in locales)
	{
		i18nConcatFilesMap.push({
			src: [
				"js/i18n/"+locales[i]+"/*.js"
			],
			dest: buildPath+"/js/i18n/"+locales[i]+".js"
		});
	}

	grunt.initConfig({
		pkg: pkg,
		clean: {
			build: buildPath
		},
		concat: {
			options: {
				separator: "\n\n"
			},
			base: {
				src: [
					"js/base/intro.js",
					"js/base/core.js",
					"js/base/string.js",
					"js/base/html.js",
					"js/base/dom.js",
					"js/base/css.js",
					"js/base/browser.js",
					"js/base/time.js",
					"js/base/widget.js",
					"js/base/outro.js"
				],
				dest: buildPath+"/js/base.js"
			},
			all: {
				src: [
					buildPath+"/js/base.js",
					"js/widgets/*.js"
				],
				dest: buildPath+"/js/hop.js"
			},
			i18n: {
				files: i18nConcatFilesMap
			},
			css: {
				src: [
					"themes/default/css/*"
				],
				dest: buildPath+"/themes/default/css/hop.css"
			}
		},
		copy: {
			build: {
				files: [
					{
						src: [
							"demos/**",
							"external/**",
							"themes/**",
							"js/i18n/**",
							"js/widgets/**"
						],
						dest: buildPath,
						expand: true
					},
					{
						src: "LICENSE.txt",
						dest: buildPath+"/LICENSE.txt"
					}
				]
			}
		},
		jshint: {
			options: {
				multistr: true,
				laxbreak: true
			},
			src: [
				"js/Gruntfile.js",
				"js/base/core.js",
				"js/base/string.js",
				"js/base/html.js",
				"js/base/dom.js",
				"js/base/css.js",
				"js/base/browser.js",
				"js/base/time.js",
				"js/base/widget.js",
				"js/widgets/*.js",
				"js/i18n/*.js"
			]
		},
		"string-replace": {
			info: {
				files: [
					{
						src: buildPath+"/js/**",
						expand: true
					}
				],
				options: {
					replacements: [
						{
							pattern: /@VERSION/g,
							replacement: pkg.version
						},
						{
							pattern: /@AUTHOR/g,
							replacement: pkg.author
						},
						{
							pattern: /@DATE/g,
							replacement: grunt.template.today("isoUtcDateTime")
						}
					]
				}
			}
		},
		uglify: {
			options: {
				preserveComments: "some"
			},
			all: {
				files: minFilesMap
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-string-replace");
	grunt.registerTask("default", [
		"clean",
		"copy",
		"concat",
		"string-replace",
		"uglify"
	]);
	grunt.registerTask("jshintsrc", [
		"jshint:src"
	]);
};