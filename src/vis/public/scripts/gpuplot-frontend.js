requirejs.config({
	paths : {
		jquery : "../bower_components/jquery/dist/jquery.min",
		jqueryui : "../bower_components/jqueryui/jquery-ui.min", 
		socketio : '../bower_components/socket.io-client/socket.io',
		threejs : '../bower_components/threejs/build/three.min'
	},
	shim : {
		jquery : {
			exports : "$"
		},
		jqueryui : {
			// exports : "$",
			deps : [ 'jquery' ]
		},
		threejs : {
			exports : 'THREE'
		}
	}
});

requirejs([ "socketio", "jquery", "jqueryui" ], function ( io, $ ) {

	
	requirejs([ "threejs" ], function ( THREE ) {


		$( document ).ready( function () {

			// create a basic fullscreen THREE.js scene
			var parent = $('#canvas-wrap');
				height = parent.height(),
				width = parent.width();
				scene = new THREE.Scene(),
				camera = new THREE.PerspectiveCamera( 65, width / height, 0.1, 1000 ),
				renderer = new THREE.WebGLRenderer( { antialias : true } );
			
			renderer.setSize( width, height );
			$( renderer.domElement ).appendTo( parent);
			// renderer.setClearColor( 0x000000, 0 );
			camera.position.set(0,-100,100);
			camera.lookAt(new THREE.Vector3(0,0,0));


			var geometry = new THREE.PlaneGeometry(100,100,10,10);

			var plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
				color: 0xffffff, 
				specular: 0xffffff, 
				shininess: 30, 
				shading: THREE.SmoothShading
			}));

			// three point lighting setup
			var light = new THREE.DirectionalLight( 0xffffff, 0.25 );
			light.position.set( 0, 100, 100 );
			
			scene.add(light);
			scene.add(plane);

			function render () {
				requestAnimationFrame(render); 
				renderer.render(scene, camera); 
			}

			render()

		});

	});

});