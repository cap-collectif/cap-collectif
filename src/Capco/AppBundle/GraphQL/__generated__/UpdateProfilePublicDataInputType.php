<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class UpdateProfilePublicDataInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateProfilePublicDataInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateProfilePublicDataInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'userId' => [
                    'type' => Type::id(),
                    'description' => '(ROLE_SUPER_ADMIN only) the user to update, if not provided the viewer is updated.',
                ],
                'username' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Your username',
                ],
                'userType' => [
                    'type' => Type::id(),
                    'description' => 'Your user type',
                ],
                'biography' => [
                    'type' => Type::string(),
                    'description' => 'Your biography',
                ],
                'neighborhood' => [
                    'type' => Type::string(),
                    'description' => 'Your neighborhood',
                ],
                'website' => [
                    'type' => Type::string(),
                    'description' => 'Your website',
                ],
                'linkedInUrl' => [
                    'type' => Type::string(),
                    'description' => 'Your linkedIn',
                ],
                'facebookUrl' => [
                    'type' => Type::string(),
                    'description' => 'Your facebook',
                ],
                'twitterUrl' => [
                    'type' => Type::string(),
                    'description' => 'Your twitter',
                ],
                'profilePageIndexed' => [
                    'type' => Type::boolean(),
                    'description' => 'Do you want to be indexed in web search engine ?',
                ],
                'media' => [
                    'type' => Type::id(),
                    'description' => 'Current media id',
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
