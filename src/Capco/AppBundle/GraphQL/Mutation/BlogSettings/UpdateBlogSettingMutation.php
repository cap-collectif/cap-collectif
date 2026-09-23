<?php

namespace Capco\AppBundle\GraphQL\Mutation\BlogSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateBlogSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const BLOG_PARAMETER_NOT_FOUND = 'BLOG_PARAMETER_NOT_FOUND';
    final public const BLOG_PARAMETER_INVALID_VALUE = 'BLOG_PARAMETER_INVALID_VALUE';

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation,
        private readonly ValidatorInterface $validator
    ) {
    }

    /**
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            $siteParameter = $this->getSiteParameter($input);
            $currentLocale = $siteParameter->getCurrentLocale();
            $value = (string) $input->offsetGet('value');
            self::checkValue($siteParameter, $value);
            $locale = $input->offsetGet('locale');
            $siteParameter->setValue($value, $locale);
            $siteParameter->setCurrentLocale($locale);
            if ($this->validator->validate($siteParameter)->count() > 0) {
                throw new UserError(self::BLOG_PARAMETER_INVALID_VALUE);
            }
            $siteParameter->setCurrentLocale($currentLocale);
            $siteParameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            $siteParameter->mergeNewTranslations();
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $this->updateSiteParameterMutation->invalidateCache($siteParameter);

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        $siteParameter = $this->repository->find($input->offsetGet('id'));

        if (!$siteParameter instanceof SiteParameter || 'pages.blog' !== $siteParameter->getCategory()) {
            throw new UserError(self::BLOG_PARAMETER_NOT_FOUND);
        }

        return $siteParameter;
    }

    private static function checkValue(SiteParameter $siteParameter, string $value): void
    {
        if (SiteParameter::TYPE_INTEGER === (int) $siteParameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
            throw new UserError(self::BLOG_PARAMETER_INVALID_VALUE);
        }
    }
}
