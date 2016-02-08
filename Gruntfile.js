module.exports = function(grunt)
{
	var pkg = grunt.file.readJSON("package.json"),
		fs = require("fs"),
		buildPath = "build/hopjs-"+pkg.version,
		concatAll = [
			buildPath+"/js/base.js",
			"js/widgets/datepicker.js",
			"js/widgets/datepickeranimations.js",
			"js/widgets/draggable.js",
			"js/widgets/dropdownmenu.js",
			"js/widgets/layer.js",
			"js/widgets/menu.js",
			"js/widgets/menubutton.js",
			"js/widgets/resizable.js",
			"js/widgets/tabs.js",
			"js/widgets/tooltip.js",
			"js/widgets/window.js",
			"js/widgets/dialog.js",
			"js/widgets/message.js"
		],
		minFiles = [
			"hop",
			"base",
			"widgets/datepicker",
			"widgets/datepickeranimations",
			"widgets/dialog",
			"widgets/draggable",
			"widgets/dropdownmenu",
			"widgets/layer",
			"widgets/menu",
			"widgets/menubutton",
			"widgets/message",
			"widgets/resizable",
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
			dest: buildPath+'/js/min/'+minFiles[i]+'.min.js'
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
			all: {
				src: concatAll,
				dest: buildPath+"/js/hop.js"
			},
			i18n: {
				files: i18nConcatFilesMap
			},
			css: {
				src: [
					buildPath+"/themes/default/css/*"
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
							"js/**",
							"themes/default/images/**"
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
				"js/**"
			]
		},
		sass: {  
			dist: {
				options: {
					outputStyle: "expanded",
					indentType: "tab",
					indentWidth: 1
				},
				files: [{
					expand: true,
					cwd: "themes/default/scss",
					src: ["*.scss"],
					dest: buildPath+"/themes/default/css",
					ext: '.css'
				}]
			}
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
	grunt.loadNpmTasks("grunt-sass");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-string-replace");
	grunt.registerTask("default", [
		"clean",
		"copy",
		"sass",
		"concat",
		"string-replace",
		"uglify"
	]);
	grunt.registerTask("jshintsrc", [
		"jshint:src"
	]);
};