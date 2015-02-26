<?php


class ColumnTableSeeder extends Seeder {

	
	public function run()
	{

		$columns = [

			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/87709bfc4d0b">A Spending Plan</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/4827ec319f97">A Game Plan for 2015</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/ed143692496c">Conquer the Clutter</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/ac7af39debac">Step Back to Go Forward</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/1de1f5b6a748">Keep the Woe, Woe, Woe Out of your Ho, Ho, Ho</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/f73d6aed4802">Is it Time for Another Recession?</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/c8ec0bfe26e0">Radical Generosity</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/23e3b4e3d321">Don’t Let These Years Casually Pass…</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/cc3bbd2d10e1">Leaving a Legacy of Love</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/4c6eb613654">The Education of Money</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/1064fa00a1fb">Selecting a Financial Professional</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/73ecded7d503">What is the Real Treasure?</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/ff3d62bd92e7">The Power of Possessions</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/7367503e7775">Thinking for Tomorrow, Today.</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/79cb346e490d">Empowering Women</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/6add96b70ba7">The Beginning &amp; End of Wisdom</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/ec5f0be58320">The Power of ONE</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/4a0ce3f113f1">Generosity Shows Leadership</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/d50da548a211">Avoid the Use of Debt</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/5a38fdd9e74">Redefining Retirement</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/806d8c85774a">The Power of Contentment</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/2c27372d62bd">Taking Steps of Faith</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/468491f571f0">The Power of a Paradigm Shift</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@onedegreesaffer/80b56580d42b">The Plans of the Diligent</a>'],
			['link' => '<a class="m-story" data-collapsed="true" href="https://medium.com/@janicethompson/b8402db02446">The Power of Planning</a>']

		];

		DB::table('columns')->insert($columns);
		
	}
	

}