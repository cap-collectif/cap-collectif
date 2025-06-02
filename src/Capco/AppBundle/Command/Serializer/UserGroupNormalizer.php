<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\GraphQL\Resolver\Group\GroupMembersResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserGroupNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        private readonly GroupMembersResolver $groupMembersResolver,
        TranslatorInterface $translator
    ) {
        parent::__construct($translator);
    }

    /**
     * @param UserGroup            $data
     * @param null|string          $format
     * @param array<array<string>> $context
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER]) && $data instanceof UserGroup && !isset($context['groups']);
    }

    /**
     * @param UserGroup            $object
     * @param null|string          $format
     * @param array<array<string>> $context
     *
     * @return array<string>
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        $group = $object->getGroup();

        $userGroupArray = [
            self::EXPORT_USER_GROUPS_TITLE => $group->getTitle(),
            self::EXPORT_USER_GROUPS_DESCRIPTION => $group->getDescription(),
            self::EXPORT_USER_GROUPS_COUNT_USER_GROUPS => $this->groupMembersResolver->__invoke($group, new Argument())->getTotalCount(),
            self::EXPORT_USER_GROUPS_CREATED_AT => $this->getNullableDateTime($group->getCreatedAt()),
            self::EXPORT_USER_GROUPS_UPDATED_AT => $this->getNullableDateTime($group->getUpdatedAt()),
        ];

        return $this->translateHeaders($userGroupArray);
    }
}
