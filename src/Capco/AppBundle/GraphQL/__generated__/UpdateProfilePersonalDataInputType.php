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
final class UpdateProfilePersonalDataInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateProfilePersonalDataInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateProfilePersonalDataInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'userId' => [
                    'type' => Type::id(),
                    'description' => '(ROLE_SUPER_ADMIN only) the user to update, if not provided the viewer is updated.',
                ],
                'firstname' => [
                    'type' => Type::string(),
                    'description' => 'Your firstname',
                ],
                'lastname' => [
                    'type' => Type::string(),
                    'description' => 'Your lastname',
                ],
                'gender' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('GenderValue'),
                    'description' => 'Your gender',
                ],
                'phone' => [
                    'type' => Type::string(),
                    'description' => 'Your phone number',
                ],
                'address' => [
                    'type' => Type::string(),
                    'description' => 'Your address',
                ],
                'address2' => [
                    'type' => Type::string(),
                    'description' => 'Your complementary address',
                ],
                'city' => [
                    'type' => Type::string(),
                    'description' => 'Your city',
                ],
                'zipCode' => [
                    'type' => Type::string(),
                    'description' => 'Your zipcode',
                ],
                'dateOfBirth' => [
                    'type' => Type::string(),
                    'description' => 'Your date of birth',
                ],
                'phoneConfirmed' => [
                    'type' => Type::boolean(),
                    'description' => 'Is your phone confirmed ?',
                ],
                'email' => [
                    'type' => Type::string(),
                    'description' => 'Your email',
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
