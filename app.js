/*jshint bitwise:false, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:false, nonew:true, plusplus:false, regexp:false, undef:true, strict:true, trailing:true, expr:true, regexdash:true, browser:true, jquery:true, onevar:true */
/*global require:false, process:false, console:false, __dirname:false, exports:false */
(function () {
    "use strict";
    var kippt = require('node-kippt'),
        express = require('express'),
        path = require('path'),
        http = require('http'),
        expressLayouts = require('express-ejs-layouts'),
        app = express(),

        // Global Application settings
        AppConfig = require('./bin/app_config'),

        // Kippt Clips
        Kippt = require('./bin/kippt_clips'),

        startup = require('./bin/startup'),

        // Email Template and dummy html
        emailTemplates = require('./bin/templates'),
		
		// ROUTES OBJECTS
        sendemail = require('./routes/sendemail'),
		
		mapAndFilter = require('./bin/map_and_filter');
		
		configureExpress();
	
		var schedulerFired = function(){
			console.log("scheduler fired");			
			new Kippt.KipptClips().getClips(clipsRetrieved);						
		};
		
		var clipsRetrieved = function(clips) {
			console.log('clips retrieved');
			
			var mappedClips = mapAndFilter(clips);
			
			console.log('filtered clips');
			
			var html = emailTemplates.templates.compileTemplate(mappedClips);
			
			console.log('created html');
			
			console.log(html);
		};			
		
		startup.start(process.argv, schedulerFired);
	
	function configureExpress()
	{
		console.log("configuring express");
	
		app.configure(function () {
			app.set('views', __dirname + '/views');
			app.set('port', AppConfig.AppConfig.Express.PORT);
			app.set('view engine', 'ejs');
			app.use(expressLayouts);
			app.use(express.static(path.join(__dirname, 'public')));
			app.use(app.router);
		});
		app.configure('development', function () {
			app.use(express.errorHandler());
		});
		// ROUTES
		app.get('/sendemail', sendemail.index);
		app.get('/', sendemail.index);
		
		http.createServer(app).listen(app.get('port'), function () {
			console.log("Express server listening on port " + app.get('port'));
		});
			
		console.log("configured express");
	}
    
}());
