<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Form\Type\MemberSearchType;
use Capco\UserBundle\Repository\UserTypeRepository;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class MembersController extends Controller
{
    private $userTypeRepository;
    private $userSearch;

    public function __construct(UserTypeRepository $userTypeRepository, UserSearch $userSearch)
    {
        $this->userTypeRepository = $userTypeRepository;
        $this->userSearch = $userSearch;
    }

    /**
     * @Route("/members/{page}", name="app_members", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "members_list"})
     * @Route("/members/{userType}/{page}", name="app_members_type", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "members_list"} )
     * @Route("/members/{userType}/{sort}/{page}", name="app_members_type_sorted", requirements={"page" = "\d+"}, defaults={"page" = 1, "userType" = null, "_feature_flags" = "members_list"} )
     * @Template("CapcoUserBundle:Members:index.html.twig")
     */
    public function indexAction(Request $request, $page, $userType = null, $sort = null)
    {
        $currentUrl = $this->generateUrl('app_members');

        $form = $this->createForm(MemberSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST'
        ]);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect(
                    $this->generateUrl('app_members_type_sorted', [
                        'userType' => $data['userType']
                            ? $data['userType']->getSlug()
                            : UserType::FILTER_ALL,
                        'sort' => $data['sort']
                    ])
                );
            }
        } else {
            $form->setData([
                'userType' => $this->userTypeRepository->findOneBySlug($userType),
                'sort' => $sort
            ]);
        }

        $pagination = $this->get(Resolver::class)->getValue('members.pagination.size');

        $sort = $sort ?? 'activity';
        $userType = $this->userTypeRepository->findOneBySlug($userType);
        $members = $this->userSearch->getRegisteredUsers($pagination, $page, $sort, $userType);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
            $nbPage = ceil($members['totalCount'] / $pagination);
        }

        return [
            'members' => $members['results'],
            'page' => $page,
            'nbPage' => $nbPage,
            'form' => $form->createView()
        ];
    }
}
