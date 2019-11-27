<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Form\Type\TrashedStatusType;
use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class SourceAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
        $query
            ->leftJoin($query->getRootAliases()[0].'.opinion', 'op')
            ->innerJoin('op.consultation', 'opc')
            ->innerJoin('opc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('authors.user', ':author'),
                        $query->expr()->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                    )
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'global.author'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail().' - '.$enitity->getUsername();
                    },
                ]
            )
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add('category', null, ['label' => 'global.type'])
            ->add('link', null, ['label' => 'global.link'])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('author', 'sonata_type_model', ['label' => 'global.author'])
            ->add('opinion', 'sonata_type_model', ['label' => 'global.proposal'])
            ->add('category', 'sonata_type_model', ['label' => 'global.type'])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published',
            ])
            ->add('trashedStatus', null, [
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
                'label' => 'global.is_trashed',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', ['actions' => ['delete' => []]]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();
        $formMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail().' - '.$enitity->getUsername();
                },
            ])
            ->add('opinion', 'sonata_type_model', ['label' => 'global.proposal'])
            ->add('category', 'sonata_type_model', ['label' => 'global.type'])
            ->add('link', null, [
                'label' => 'global.link',
                'attr' => ['placeholder' => 'http://www.cap-collectif.com/'],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.comment.trashed_reason',
                'required' => false,
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
