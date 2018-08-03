<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class OpinionAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected $formOptions = ['cascade_validation' => true];

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $opinionTypeId = null;

        if ($subject && $subject->getOpinionType()) {
            $opinionTypeId = $subject->getOpinionType()->getId();
        } else {
            $opinionTypeId = $this->getRequest()->get('opinion_type_id');
        }

        return ['opinion_type' => $opinionTypeId];
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Opinion:list.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Opinion:edit.html.twig';
        }
        if ('delete' === $name) {
            return 'CapcoAdminBundle:Opinion:delete.html.twig';
        }

        return parent::getTemplate($name);
    }

    public function getBatchActions()
    {
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->add('title', null, ['label' => 'admin.fields.opinion.title'])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.opinion.author'],
                null,
                ['property' => 'username']
            )
            ->add('step', null, ['label' => 'admin.fields.opinion.step'])
            ->add('OpinionType', null, ['label' => 'admin.fields.opinion.opinion_type'])
            ->add('isEnabled', null, ['label' => 'admin.fields.opinion.is_enabled'])
            ->add('pinned', null, ['label' => 'admin.fields.opinion.pinned_long'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.opinion.is_trashed'])
            ->add('updatedAt', null, ['label' => 'admin.fields.opinion.updated_at'])
            ->add('argumentsCount', null, ['label' => 'admin.fields.opinion.argument_count'])
            ->add('sourcesCount', null, ['label' => 'admin.fields.opinion.source_count'])
            ->add('expired', null, ['label' => 'admin.global.expired']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->addIdentifier('title', null, ['label' => 'admin.fields.opinion.title'])
            ->add('Author', 'sonata_type_model', ['label' => 'admin.fields.opinion.author'])
            ->add('OpinionType', null, ['label' => 'admin.fields.opinion.opinion_type'])
            ->add('step', 'sonata_type_model', ['label' => 'admin.fields.opinion.step'])
            ->add('voteCountTotal', 'integer', [
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig',
            ])
            ->add('position', null, ['label' => 'admin.fields.opinion.position'])
            ->add('argumentsCount', null, ['label' => 'admin.fields.opinion.argument_count'])
            ->add('sourcesCount', null, ['label' => 'admin.fields.opinion.source_count'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.opinion.is_enabled',
            ])
            ->add('pinned', null, ['editable' => true, 'label' => 'admin.fields.opinion.pinned'])
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.opinion.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.opinion.updated_at'])
            ->add('_action', 'actions', ['actions' => ['delete' => []]]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $subjectHasAppendices =
            $this->getSubject()
                ->getAppendices()
                ->count() > 0;
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();

        $classname = $subjectHasAppendices ? '' : 'hidden';
        $formMapper
            ->with('admin.fields.opinion.group_content', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion.group_appendices', ['class' => 'col-md-12 ' . $classname])
            ->end()
            ->with('admin.fields.opinion.group_publication', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion.group_answer', ['class' => 'col-md-12'])
            ->end()
            ->end();
        // Content
        // Appendices
        // Publication
        // Answer
        $formMapper
            ->with('admin.fields.opinion.group_content')
            ->add('title', null, ['label' => 'admin.fields.opinion.title'])
            ->add('Author', ModelAutocompleteType::class, [
                'label' => 'admin.fields.opinion.author',
                'property' => 'username',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.opinion.position',
                'required' => false,
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.opinion.body',
                'config_name' => 'admin_editor',
            ])
            ->add('step', null, [
                'label' => 'admin.fields.opinion.step',
                'query_builder' => $this->createQueryBuilderForStep(),
                'choice_label' => 'labelTitle',
                'required' => true,
            ])
            ->end()

            ->with('admin.fields.opinion.group_appendices')
            ->add('appendices', 'sonata_type_collection', [
                'label' => 'admin.fields.opinion.appendices',
                'by_reference' => false,
                'required' => false,
                'btn_add' => false,
                'type_options' => ['delete' => false, 'btn_add' => false],
                'attr' => ['class' => $classname],
            ])
            ->end()

            ->with('admin.fields.opinion.group_publication')
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion.is_enabled',
                'required' => false,
            ])
            ->add('pinned', null, [
                'label' => 'admin.fields.opinion.pinned_long',
                'required' => false,
            ])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'attr' => [
                    'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    'readonly' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                ],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'admin.fields.opinion.trashed_reason'])
            ->end()

            ->with('admin.fields.opinion.group_answer')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'admin.fields.opinion.answer',
                'btn_list' => false,
                'required' => false,
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'export']);
    }

    private function createQueryBuilderForStep()
    {
        if (!$this->getPersistentParameter('opinion_type')) {
            return;
        }

        $em = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager();

        $opinionType = $em
            ->getRepository('CapcoAppBundle:OpinionType')
            ->find($this->getPersistentParameter('opinion_type'));

        if (!$opinionType) {
            throw new \InvalidArgumentException('Invalid opinion type.');
        }

        $consultationStepType = $opinionType->getConsultationStepType();

        return $em
            ->getRepository('CapcoAppBundle:Steps\ConsultationStep')
            ->createQueryBuilder('cs')
            ->join('cs.consultationStepType', 'type')
            ->where('type = :stepType')
            ->setParameter('stepType', $consultationStepType);
    }
}
