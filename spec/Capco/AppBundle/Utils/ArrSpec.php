<?php

namespace spec\Capco\AppBundle\Utils;

use Capco\AppBundle\Utils\Arr;
use PhpSpec\ObjectBehavior;

class ArrSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(Arr::class);
    }

    public function it_should_return_correct_value_based_on_simple_path(): void
    {
        $array = [
            'test' => 'My value',
        ];

        $this::path($array, 'test')->shouldReturn('My value');
    }

    public function it_should_return_correct_value_based_on_complex_path_when_return_value_is_a_string(): void
    {
        $array = [
            'nested' => [
                'complex' => [
                    'path' => [
                        'value' => 'Que fais tu ici ?',
                    ],
                ],
            ],
        ];

        $this::path($array, 'nested.complex.path.value')->shouldReturn('Que fais tu ici ?');
    }

    public function it_should_return_correct_value_based_on_complex_path_when_return_value_is_an_array(): void
    {
        $array = [
            'nested' => [
                'complex' => [
                    'path' => [
                        'value' => [
                            'test' => 'My value',
                        ],
                    ],
                ],
            ],
        ];

        $this::path($array, 'nested.complex.path.value')->shouldReturn([
            'test' => 'My value',
        ]);
    }

    public function it_should_return_null_if_path_not_found(): void
    {
        $array = [
            'nested' => [
                'complex' => [
                    'path' => [
                        'value' => 'Que fais tu ici ?',
                    ],
                ],
            ],
        ];

        $this::path($array, 'nested.complex.path.inexistant')->shouldReturn(null);
    }
}
