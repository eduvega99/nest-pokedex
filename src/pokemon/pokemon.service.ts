import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    } else if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    } else {
      const name = term.toLowerCase().trim();
      pokemon = await this.pokemonModel.findOne({ name });
    }
    if (!pokemon)
      throw new NotFoundException(`Pokemon with term ${term} not found`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (!deletedCount)
      throw new BadRequestException(`Pokemon with id ${id} not found`);
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      const errorMessage = `Pokemon already exists in db: ${JSON.stringify(error.keyValue)}`;
      throw new BadRequestException(errorMessage);
    }
    throw new InternalServerErrorException();
  }
}