<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Mutation\AddProposalsFromCsvMutation;
use Capco\AppBundle\Import\ImportProposalsFromCsv;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use DG\BypassFinals;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

BypassFinals::enable();

class AddProposalsFromCsvMutationSpec extends ObjectBehavior
{
    public function let(
        ProposalFormRepository $proposalFormRepository,
        LoggerInterface $logger,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ConnectionBuilder $connectionBuilder,
        MediaRepository $mediaRepository,
        EntityManagerInterface $em
    ) {
        $this->beConstructedWith(
            $proposalFormRepository,
            $logger,
            $importProposalsFromCsv,
            $connectionBuilder,
            $mediaRepository,
            $em
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddProposalsFromCsvMutation::class);
    }

    public function it_return_an_error_proposal_form_not_found(
        Arg $input,
        MediaRepository $mediaRepository,
        Media $media,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ProposalFormRepository $proposalFormRepository
    ) {
        $input->offsetGet('csvToImport')->willReturn('MediaUUID');
        $media->getProviderReference()->willReturn('filename.csv');
        $mediaRepository->find('MediaUUID')->willReturn($media);
        $importProposalsFromCsv
            ->setFilePath('/public/media/default/0001/01/filename.csv')
            ->shouldBeCalled();

        $input->offsetGet('delimiter')->willReturn(';');
        $importProposalsFromCsv->setDelimiter(';')->shouldBeCalled();

        $input->offsetGet('proposalFormId')->willReturn('badUUID');
        $proposalFormRepository->find('badUUID')->willReturn(null);

        $fail = [
            'importableProposals' => 0,
            'importedProposals' => [],
            'badLines' => [],
            'duplicates' => [],
            'mandatoryMissing' => [],
            'errorCode' => AddProposalsFromCsvMutation::PROPOSAL_FORM_NOT_FOUND,
        ];

        $this->__invoke($input)->shouldReturn($fail);
    }

    public function it_return_an_error_file_is_empty(
        Arg $input,
        MediaRepository $mediaRepository,
        Media $media,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ProposalForm $proposalForm,
        ProposalFormRepository $proposalFormRepository,
        CollectStep $step
    ) {
        BypassFinals::enable();

        $input->offsetGet('csvToImport')->willReturn('MediaUUID');
        $media->getProviderReference()->willReturn('filename.csv');
        $mediaRepository->find('MediaUUID')->willReturn($media);
        $importProposalsFromCsv
            ->setFilePath('/public/media/default/0001/01/filename.csv')
            ->shouldBeCalled();

        $input->offsetGet('delimiter')->willReturn(';');
        $input->offsetGet('dryRun')->willReturn(false);
        $importProposalsFromCsv->setDelimiter(';')->shouldBeCalled();

        $input->offsetGet('proposalFormId')->willReturn('badUUID');
        $proposalFormRepository->find('badUUID')->willReturn($proposalForm);

        $importProposalsFromCsv->setProposalForm($proposalForm)->shouldBeCalled();
        $proposalForm->getStep()->willReturn($step);
        $importProposalsFromCsv
            ->import($step, false)
            ->willThrow(new \RuntimeException('EMPTY_FILE'));

        $fail = [
            'importableProposals' => 0,
            'importedProposals' => [],
            'badLines' => [],
            'duplicates' => [],
            'mandatoryMissing' => [],
            'errorCode' => AddProposalsFromCsvMutation::EMPTY_FILE,
        ];

        $this->__invoke($input)->shouldReturn($fail);
    }

    public function it_return_an_error_bad_data_model(
        Arg $input,
        MediaRepository $mediaRepository,
        Media $media,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ProposalForm $proposalForm,
        ProposalFormRepository $proposalFormRepository,
        CollectStep $step
    ) {
        BypassFinals::enable();

        $input->offsetGet('csvToImport')->willReturn('MediaUUID');
        $media->getProviderReference()->willReturn('filename.csv');
        $mediaRepository->find('MediaUUID')->willReturn($media);
        $importProposalsFromCsv
            ->setFilePath('/public/media/default/0001/01/filename.csv')
            ->shouldBeCalled();

        $input->offsetGet('delimiter')->willReturn(';');
        $input->offsetGet('dryRun')->willReturn(false);
        $importProposalsFromCsv->setDelimiter(';')->shouldBeCalled();

        $input->offsetGet('proposalFormId')->willReturn('badUUID');
        $proposalFormRepository->find('badUUID')->willReturn($proposalForm);

        $importProposalsFromCsv->setProposalForm($proposalForm)->shouldBeCalled();
        $proposalForm->getStep()->willReturn($step);
        $importProposalsFromCsv
            ->import($step, false)
            ->willThrow(new \RuntimeException('BAD_DATA_MODEL'));

        $fail = [
            'importableProposals' => 0,
            'importedProposals' => [],
            'badLines' => [],
            'duplicates' => [],
            'mandatoryMissing' => [],
            'errorCode' => AddProposalsFromCsvMutation::BAD_DATA_MODEL,
        ];

        $this->__invoke($input)->shouldReturn($fail);
    }

    public function it_return_an_error_step_not_found(
        Arg $input,
        MediaRepository $mediaRepository,
        Media $media,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ProposalForm $proposalForm,
        ProposalFormRepository $proposalFormRepository,
        CollectStep $step
    ) {
        BypassFinals::enable();

        $input->offsetGet('csvToImport')->willReturn('MediaUUID');
        $media->getProviderReference()->willReturn('filename.csv');
        $mediaRepository->find('MediaUUID')->willReturn($media);
        $importProposalsFromCsv
            ->setFilePath('/public/media/default/0001/01/filename.csv')
            ->shouldBeCalled();

        $input->offsetGet('delimiter')->willReturn(';');
        $input->offsetGet('dryRun')->willReturn(false);
        $importProposalsFromCsv->setDelimiter(';')->shouldBeCalled();

        $input->offsetGet('proposalFormId')->willReturn('badUUID');
        $proposalFormRepository->find('badUUID')->willReturn($proposalForm);

        $importProposalsFromCsv->setProposalForm($proposalForm)->shouldBeCalled();
        $proposalForm->getStep()->willReturn($step);
        $importProposalsFromCsv
            ->import($step, false)
            ->willThrow(new \RuntimeException('STEP_NOT_FOUND'));

        $this->shouldThrow(new \RuntimeException('STEP_NOT_FOUND'))->during('__invoke', [$input]);
    }
}
