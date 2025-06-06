<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\Resolver\SectionResolver;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Argument;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class HomepageController extends Controller
{
    public function __construct(private readonly QueryEventsResolver $eventsResolver, private readonly SectionResolver $sectionResolver, private readonly Manager $manager, private readonly TranslatorInterface $translator)
    {
    }

    /**
     * @Route("/", name="app_homepage")
     * @Template("@CapcoApp/Homepage/homepage.html.twig")
     */
    public function homepageAction(Request $request)
    {
        $locale = $request->getLocale();
        $sections = $this->sectionResolver->getDisplayableEnabledOrdered();
        $eventsCount = $this->eventsResolver
            ->getEventsConnection(
                new Argument(['isFuture' => true, 'first' => 0, 'locale' => $locale])
            )
            ->getTotalCount()
        ;

        $deleteType = $request->get('deleteType');

        if ($deleteType) {
            $flashBag = $this->get('session')->getFlashBag();
            if (DeleteAccountType::SOFT === $deleteType) {
                $flashBag->add(
                    'success',
                    $this->translator->trans('account-and-contents-anonymized')
                );
            } elseif (DeleteAccountType::HARD === $deleteType) {
                $flashBag->add('success', $this->translator->trans('account-and-contents-deleted'));
            }
        }

        return [
            'sections' => $sections,
            'eventsCount' => $eventsCount,
        ];
    }
}
