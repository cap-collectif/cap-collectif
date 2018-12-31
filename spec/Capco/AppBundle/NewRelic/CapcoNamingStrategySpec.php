<?php

namespace spec\Capco\AppBundle\NewRelic;

use Capco\AppBundle\NewRelic\CapcoNamingStrategy;
use Overblog\GraphQLBundle\Request\Parser;
use Overblog\GraphQLBundle\Request\ParserInterface;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;

class CapcoNamingStrategySpec extends ObjectBehavior
{
    public function let(Parser $parser)
    {
        $this->beConstructedWith($parser);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CapcoNamingStrategy::class);
    }

    public function it_should_return_operation_name_when_graphql_endpoint_is_hit(
        Request $request,
        Parser $parser
    ) {
        $requestBody = 'query getProjects() {
            projects {
                edges {
                    node {
                        id
                        title
                    }
                }
            }
        }';

        $request->get('_route')->willReturn('graphql_multiple_endpoint');
        $request->getContent()->willReturn($requestBody);

        $parser->parse($request)->willReturn([
            ParserInterface::PARAM_OPERATION_NAME => 'getProjects',
            ParserInterface::PARAM_QUERY => $requestBody,
            ParserInterface::PARAM_VARIABLES => null,
        ]);

        $this->beConstructedWith($parser);

        $this->getTransactionName($request)->shouldReturn('GraphQL::getProjects');
    }

    public function it_should_return_route_name_when_no_graphql_endpoint_is_hit(
        Request $request,
        Parser $parser
    ) {
        $request->get('_route')->willReturn('capco_app_homepage');
        $this->beConstructedWith($parser);
        $this->getTransactionName($request)->shouldReturn('capco_app_homepage');
    }
}
