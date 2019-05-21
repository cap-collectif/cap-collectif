<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class ArgumentAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];
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
            ->leftJoin($query->getRootAliases()[0] . '.opinion', 'op')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $qb->expr()->eq(':viewer', 'authors.user'),
                        $query->expr()->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                    )
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        $query->setParameter('author', $user);

        return $query;
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', null, ['label' => 'admin.fields.argument.type'])
            ->add('opinion', null, ['label' => 'admin.fields.argument.opinion'])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.argument.author'],
                null,
                [
                    'property' => 'username,email',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            )
            ->add('votesCount', null, ['label' => 'admin.fields.argument.vote_count'])
            ->add('updatedAt', null, ['label' => 'admin.fields.argument.updated_at'])
            ->add('published', null, ['label' => 'admin.fields.argument.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.argument.is_trashed']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('body', null, [
                'label' => 'admin.fields.argument.body',
                'template' => 'CapcoAdminBundle:Argument:body_list_field.html.twig',
            ])
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_list_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ])
            ->add('opinion', 'sonata_type_model', ['label' => 'admin.fields.argument.opinion'])
            ->add('Author', 'sonata_type_model', ['label' => 'admin.fields.argument.author'])
            ->add('votesCount', null, ['label' => 'admin.fields.argument.vote_count'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'admin.fields.argument.is_enabled',
            ])
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.opinion.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', 'datetime', ['label' => 'admin.fields.argument.updated_at'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('type', 'choice', [
                'label' => 'admin.fields.argument.type',
                'choices' => array_flip(Argument::$argumentTypesLabels),
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('published', null, [
                'label' => 'admin.fields.argument.is_enabled',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('opinion', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.argument.opinion',
                'property' => 'title',
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.argument.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                },
            ])
            ->add('body', null, ['label' => 'admin.fields.argument.body', 'attr' => ['rows' => 10]])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.argument.trashed_reason',
                'required' => false,
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
